
const { courses, users, sessions } = require("./data");

module.exports = function handler(req, res) {
  // Retrieve class sessions
  if (req.method === "GET") {
    const { id, courseId, instructorId } = req.query;

    if (instructorId) {
      const instructor = users.find(user =>
        String(user.id) === String(instructorId) && user.role === "instructor"
      );
      if (!instructor) {
        return res.status(404).json({ success: false, message: "Instructor not found." });
      }
      const requestedCourse = courses.find(course =>
        String(course.id) === String(courseId)
      );
      if (courseId && !requestedCourse) {
        return res.status(404).json({ success: false, message: "Course not found." });
      }
      const assignedCourse = requestedCourse &&
        String(requestedCourse.instructorId) === String(instructorId);
      if (courseId && !assignedCourse) {
        return res.status(403).json({ success: false, message: "You are not assigned to this course." });
      }
    }

    // Check whether the requested course exists
    if (courseId && !courses.some(course => course.id === courseId)) {
      return res.status(404).json({
        success: false,
        message: "Course not found."
      });
    }

    let results = sessions;

    // Filter by session ID
    if (id) {
      results = results.filter(session => session.id === id);
    }

    // Filter by course ID
    if (courseId) {
      results = results.filter(session => session.courseId === courseId);
    }

    if (id && results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Session not found."
      });
    }

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  }

  // Create a class session
  if (req.method === "POST") {
    const { courseId, date, startTime, topic, instructorId } = req.body || {};

    if (!courseId || !date || !startTime || !topic || !instructorId) {
      return res.status(400).json({
        success: false,
        message: "courseId, date, startTime, topic, and instructorId are required."
      });
    }

    const instructor = users.find(user =>
      String(user.id) === String(instructorId) && user.role === "instructor"
    );
    if (!instructor) {
      return res.status(404).json({ success: false, message: "Instructor not found." });
    }

    const course = courses.find(course => String(course.id) === String(courseId));

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found."
      });
    }
    if (String(course.instructorId) !== String(instructorId)) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this course."
      });
    }

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(Date.parse(`${date}T00:00:00.000Z`)) ||
      new Date(`${date}T00:00:00.000Z`).toISOString().slice(0, 10) !== date ||
      !/^\d{2}:\d{2}$/.test(startTime) ||
      typeof topic !== "string" || !topic.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid date, start time, and topic."
      });
    }

    // Generate a unique session ID
    const newSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      courseId,
      date,
      startTime,
      topic
    };

    sessions.push(newSession);

    return res.status(201).json({
      success: true,
      message: "Class session created successfully.",
      data: newSession
    });
  }

  res.setHeader("Allow", "GET, POST");

  return res.status(405).json({
    success: false,
    message: "Method not allowed."
  });
};
