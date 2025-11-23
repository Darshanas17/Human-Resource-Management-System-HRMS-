import jwt from "jsonwebtoken";
import db from "../models/database.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret"
    );

    const user = await db.get(
      "SELECT * FROM users WHERE id = ? AND organisation_id = ?",
      [decoded.userId, decoded.orgId]
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = { userId: decoded.userId, orgId: decoded.orgId };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Export as default
export default authMiddleware;
