import express from "express";
import { dbAll, dbRun, dbGet } from "../models/database.js";
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();
router.use(authMiddleware);

// Get all teams with employee counts
router.get("/", async (req, res) => {
  try {
    const teams = await dbAll(
      `SELECT t.*, COUNT(et.employee_id) as employee_count 
       FROM teams t 
       LEFT JOIN employee_teams et ON t.id = et.team_id 
       WHERE t.organisation_id = ? 
       GROUP BY t.id
       ORDER BY t.created_at DESC`,
      [req.user.orgId]
    );

    // Always return an array
    res.json(teams || []);
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.json([]);
  }
});

// Create team
router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Team name is required" });
    }

    const result = await dbRun(
      "INSERT INTO teams (organisation_id, name, description) VALUES (?, ?, ?)",
      [req.user.orgId, name, description]
    );

    // Log action
    await dbRun(
      "INSERT INTO logs (organisation_id, user_id, action, meta) VALUES (?, ?, ?, ?)",
      [
        req.user.orgId,
        req.user.userId,
        "team_created",
        JSON.stringify({
          teamId: result.lastID,
          name,
        }),
      ]
    );

    res.status(201).json({
      id: result.lastID,
      name,
      description,
      organisation_id: req.user.orgId,
    });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(400).json({ message: "Failed to create team" });
  }
});

// Assign employee to team
router.post("/:teamId/assign", async (req, res) => {
  try {
    const { employeeId } = req.body;
    const teamId = req.params.teamId;

    if (!employeeId) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    // Check if team belongs to organisation
    const team = await dbGet(
      "SELECT * FROM teams WHERE id = ? AND organisation_id = ?",
      [teamId, req.user.orgId]
    );

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if employee belongs to organisation
    const employee = await dbGet(
      "SELECT * FROM employees WHERE id = ? AND organisation_id = ?",
      [employeeId, req.user.orgId]
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Check if assignment already exists
    const existingAssignment = await dbGet(
      "SELECT * FROM employee_teams WHERE employee_id = ? AND team_id = ?",
      [employeeId, teamId]
    );

    if (existingAssignment) {
      return res
        .status(400)
        .json({ message: "Employee already assigned to this team" });
    }

    await dbRun(
      "INSERT INTO employee_teams (employee_id, team_id) VALUES (?, ?)",
      [employeeId, teamId]
    );

    // Log action
    await dbRun(
      "INSERT INTO logs (organisation_id, user_id, action, meta) VALUES (?, ?, ?, ?)",
      [
        req.user.orgId,
        req.user.userId,
        "employee_assigned",
        JSON.stringify({
          employeeId,
          teamId,
        }),
      ]
    );

    res.json({ message: "Employee assigned to team successfully" });
  } catch (error) {
    console.error("Error assigning employee to team:", error);
    res.status(400).json({ message: "Failed to assign employee to team" });
  }
});

// Unassign employee from team
router.delete("/:teamId/unassign", async (req, res) => {
  try {
    const { employeeId } = req.body;
    const teamId = req.params.teamId;

    if (!employeeId) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    const result = await dbRun(
      "DELETE FROM employee_teams WHERE employee_id = ? AND team_id = ?",
      [employeeId, teamId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Log action
    await dbRun(
      "INSERT INTO logs (organisation_id, user_id, action, meta) VALUES (?, ?, ?, ?)",
      [
        req.user.orgId,
        req.user.userId,
        "employee_unassigned",
        JSON.stringify({
          employeeId,
          teamId,
        }),
      ]
    );

    res.json({ message: "Employee unassigned from team successfully" });
  } catch (error) {
    console.error("Error unassigning employee from team:", error);
    res.status(400).json({ message: "Failed to unassign employee from team" });
  }
}); 

// Get team members
router.get("/:teamId/members", async (req, res) => {
  try {
    const teamId = req.params.teamId;

    // Verify team belongs to organisation
    const team = await dbGet(
      "SELECT * FROM teams WHERE id = ? AND organisation_id = ?",
      [teamId, req.user.orgId]
    );

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const members = await dbAll(
      `SELECT e.* 
       FROM employees e
       INNER JOIN employee_teams et ON e.id = et.employee_id
       WHERE et.team_id = ? AND e.organisation_id = ?
       ORDER BY e.first_name, e.last_name`,
      [teamId, req.user.orgId]
    );

    res.json(members || []);
  } catch (error) {
    console.error("Error fetching team members:", error);
    res.status(500).json({ message: "Failed to fetch team members" });
  }
});

export default router;
