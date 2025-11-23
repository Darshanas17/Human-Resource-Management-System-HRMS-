import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { dbRun, dbGet } from "../models/database.js";

const router = express.Router();

// Register organisation and admin user
router.post("/register", async (req, res) => {
  try {
    const { orgName, adminName, email, password } = req.body;

    if (!orgName || !adminName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Start transaction
    await dbRun("BEGIN TRANSACTION");

    try {
      // Create organisation
      const orgResult = await dbRun(
        "INSERT INTO organisations (name) VALUES (?)",
        [orgName]
      );

      const orgId = orgResult.lastID;

      // Hash password and create user
      const hashedPassword = await bcrypt.hash(password, 10);
      const userResult = await dbRun(
        "INSERT INTO users (organisation_id, email, password_hash, name) VALUES (?, ?, ?, ?)",
        [orgId, email, hashedPassword, adminName]
      );

      // Log the action
      await dbRun(
        "INSERT INTO logs (organisation_id, user_id, action, meta) VALUES (?, ?, ?, ?)",
        [
          orgId,
          userResult.lastID,
          "organisation_created",
          JSON.stringify({ orgName, adminName }),
        ]
      );

      await dbRun("COMMIT");

      // Generate token
      const token = jwt.sign(
        { userId: userResult.lastID, orgId },
        process.env.JWT_SECRET || "fallback_secret",
        { expiresIn: "8h" }
      );

      res.status(201).json({
        token,
        orgId,
        message: "Organisation registered successfully",
      });
    } catch (error) {
      await dbRun("ROLLBACK");
      throw error;
    }
  } catch (error) {
    if (error.message.includes("UNIQUE constraint failed")) {
      return res.status(400).json({ message: "Email already exists" });
    }
    console.error("Registration error:", error);
    res
      .status(400)
      .json({ message: "Registration failed", error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await dbGet(
      `SELECT u.*, o.id as org_id 
       FROM users u 
       JOIN organisations o ON u.organisation_id = o.id 
       WHERE u.email = ?`,
      [email]
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Log login
    await dbRun(
      "INSERT INTO logs (organisation_id, user_id, action, meta) VALUES (?, ?, ?, ?)",
      [user.org_id, user.id, "user_login", JSON.stringify({ email })]
    );

    const token = jwt.sign(
      { userId: user.id, orgId: user.org_id },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "8h" }
    );

    res.json({
      token,
      orgId: user.org_id,
      userName: user.name,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

export default router;
