import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDatabase } from "./models/database.js";
import authRoutes from "./routes/auth.js";
import employeeRoutes from "./routes/employees.js";
import teamRoutes from "./routes/teams.js";
import logRoutes from "./routes/logs.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize database
initDatabase();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/logs", logRoutes);

app.get("/api/health", (req, res) => {
  res.json({ message: "HRMS Backend is running!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
