/**
 * HR Management System - Backend Server
 * Government-grade backend (Node.js + MongoDB)
 */

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

/* -------------------- DB + MODELS -------------------- */
const connectDB = require("./config/database");
const User = require("./models/User");

/* -------------------- APP INIT -------------------- */
const app = express();
const PORT = process.env.PORT || 3001;

/* -------------------- MIDDLEWARE -------------------- */
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------- HEALTH CHECK -------------------- */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "HR Management System",
    database: "MongoDB",
    version: "1.0.0"
  });
});

/* -------------------- ROUTES -------------------- */
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/employees", require("./routes/employees.routes"));
app.use("/api/departments", require("./routes/departments.routes"));
app.use("/api/analytics", require("./routes/analytics.routes"));
app.use("/api/public", require("./routes/public.routes"));


/* -------------------- ERROR HANDLER -------------------- */
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(err.status || 500).json({
    code: err.code || "INTERNAL_ERROR",
    message: err.message || "Unexpected server error",
    action: "Contact administrator"
  });
});

/* -------------------- HR ADMIN SEED -------------------- */
async function seedHRAdmin() {
  const email = "hradmin@gov.et";
  const password = "HR@Admin123";

  const existing = await User.findOne({ email });
  if (existing) {
    console.log("HR Admin already exists");
    console.log(`   Email: ${existing.email}, Role: ${existing.role}`);
    return;
  }

  // Create user with plain password - pre-save hook will hash it
  const hrAdmin = await User.create({
    email,
    password, // Plain password - will be hashed by pre-save hook
    role: "ADMIN",
    isActive: true
  });

  console.log("   HR Admin created successfully");
  console.log(`   Email: ${hrAdmin.email}`);
  console.log(`   Role: ${hrAdmin.role}`);
  console.log(`   Password hashed: ${hrAdmin.password.substring(0, 20)}...`);
}

/* -------------------- BOOTSTRAP -------------------- */
async function startServer() {
  try {
    await connectDB();
    console.log(" Connected to MongoDB");

    await seedHRAdmin();

    app.listen(PORT, () => {
      console.log(` HR Management API running on port ${PORT}`);
      console.log(`API Base: http://localhost:${PORT}/api`);
    });

  } catch (err) {
    console.error(" Server startup failed:", err);
    process.exit(1);
  }
}

startServer();

module.exports = app;
