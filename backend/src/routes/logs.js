import express from "express";
import { dbAll } from "../models/database.js";
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();
router.use(authMiddleware);

// Get logs for organisation
router.get("/", async (req, res) => {
  try {
    const logs = await dbAll(
      `SELECT l.*, u.name as user_name 
       FROM logs l 
       LEFT JOIN users u ON l.user_id = u.id 
       WHERE l.organisation_id = ? 
       ORDER BY l.timestamp DESC 
       LIMIT 100`,
      [req.user.orgId]
    );

    const parsedLogs = (logs || []).map((log) => ({
      ...log,
      meta: JSON.parse(log.meta || "{}"),
    }));

    res.json(parsedLogs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.json([]);
  }
});

export default router;
