import express from "express";
import { dbAll, dbRun, dbGet } from "../models/database.js";
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();
router.use(authMiddleware);

// Get all employees for organisation
router.get("/", async (req, res) => {
  try {
    const employees = await dbAll(
      "SELECT * FROM employees WHERE organisation_id = ? ORDER BY created_at DESC",
      [req.user.orgId]
    );

    res.json(employees || []);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.json([]);
  }
});

// Get single employee
router.get("/:id", async (req, res) => {
  try {
    const employee = await dbGet(
      "SELECT * FROM employees WHERE id = ? AND organisation_id = ?",
      [req.params.id, req.user.orgId]
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ message: "Failed to fetch employee" });
  }
});

// Create employee
router.post("/", async (req, res) => {
  try {
    const { first_name, last_name, email, phone } = req.body;

    if (!first_name || !last_name) {
      return res
        .status(400)
        .json({ message: "First name and last name are required" });
    }

    const result = await dbRun(
      "INSERT INTO employees (organisation_id, first_name, last_name, email, phone) VALUES (?, ?, ?, ?, ?)",
      [req.user.orgId, first_name, last_name, email, phone]
    );

    // Log action
    await dbRun(
      "INSERT INTO logs (organisation_id, user_id, action, meta) VALUES (?, ?, ?, ?)",
      [
        req.user.orgId,
        req.user.userId,
        "employee_created",
        JSON.stringify({
          employeeId: result.lastID,
          first_name,
          last_name,
        }),
      ]
    );

    res.status(201).json({
      id: result.lastID,
      first_name,
      last_name,
      email,
      phone,
      organisation_id: req.user.orgId,
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(400).json({ message: "Failed to create employee" });
  }
});

// Update employee
router.put("/:id", async (req, res) => {
  try {
    const { first_name, last_name, email, phone } = req.body;
    const employeeId = req.params.id;

    if (!first_name || !last_name) {
      return res
        .status(400)
        .json({ message: "First name and last name are required" });
    }

    const result = await dbRun(
      "UPDATE employees SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE id = ? AND organisation_id = ?",
      [first_name, last_name, email, phone, employeeId, req.user.orgId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Log action
    await dbRun(
      "INSERT INTO logs (organisation_id, user_id, action, meta) VALUES (?, ?, ?, ?)",
      [
        req.user.orgId,
        req.user.userId,
        "employee_updated",
        JSON.stringify({
          employeeId,
          first_name,
          last_name,
        }),
      ]
    );

    res.json({ message: "Employee updated successfully" });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(400).json({ message: "Failed to update employee" });
  }
});

// Delete employee
router.delete("/:id", async (req, res) => {
  try {
    const employeeId = req.params.id;

    const result = await dbRun(
      "DELETE FROM employees WHERE id = ? AND organisation_id = ?",
      [employeeId, req.user.orgId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Log action
    await dbRun(
      "INSERT INTO logs (organisation_id, user_id, action, meta) VALUES (?, ?, ?, ?)",
      [
        req.user.orgId,
        req.user.userId,
        "employee_deleted",
        JSON.stringify({ employeeId }),
      ]
    );

    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(400).json({ message: "Failed to delete employee" });
  }
});

export default router;
