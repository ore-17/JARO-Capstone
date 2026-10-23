
const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, "../public")));

// Import API handlers
const coursesHandler = require("./courses");
const attendanceHandler = require("./attendance");
const studentsHandler = require("./students");
const sessionsHandler = require("./sessions");
const loginHandler = require("./login");

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Login API
app.post("/api/login", (req, res) => {
    return loginHandler(req, res);
  });

// API test route
app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Course Attendance API is working!"
  });
});

// Courses API
app.all("/api/courses", (req, res) => {
  return coursesHandler(req, res);
});

// Attendance API
app.all("/api/attendance", (req, res) => {
  return attendanceHandler(req, res);
});

// Students API
app.all("/api/students", (req, res) => {
    return studentsHandler(req, res);
  });

// Class Sessions API
app.all("/api/sessions", (req, res) => {
    return sessionsHandler(req, res);
  });

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: "Internal server error."
  });
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Attendance Tracker running at http://localhost:${PORT}`);
  });
}

module.exports = app;

