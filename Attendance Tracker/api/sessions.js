
const { courses, sessions } = require("./data");

module.exports = function handler(req, res) {
  // Retrieve class sessions
  if (req.method === "GET") {
    const { id, courseId } = req.query;

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
    const { courseId, date, startTime, topic } = req.body || {};

    if (!courseId || !date || !startTime || !topic) {
      return res.status(400).json({
        success: false,
        message: "courseId, date, startTime, and topic are required."
      });
    }

    const course = courses.find(course => course.id === courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found."
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
