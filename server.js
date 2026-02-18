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
const PORT = process.env.PORT || 3002;

/* -------------------- MIDDLEWARE -------------------- */
app.use(cors({
  origin: true,
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
app.use("/api/hr", require("./routes/hr.routes"));


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
  // Seed 1: hradmin@gov.et
  const email1 = "hradmin@gov.et";
  const password1 = "HR@Admin123";

  const existing1 = await User.findOne({ email: email1 });
  if (!existing1) {
    await User.create({
      email: email1,
      password: password1,
      role: "ADMIN",
      isActive: true
    });
    console.log("✅ HR Admin created: hradmin@gov.et");
  } else {
    console.log("✅ HR Admin exists: hradmin@gov.et");
  }

  // Seed 2: admin@example.com
  const email2 = "admin@example.com";
  const password2 = "admin123";

  const existing2 = await User.findOne({ email: email2 });
  if (!existing2) {
    await User.create({
      email: email2,
      password: password2,
      role: "ADMIN",
      isActive: true
    });
    console.log("✅ Admin created: admin@example.com / admin123");
  } else {
    console.log("✅ Admin exists: admin@example.com");
  }
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
