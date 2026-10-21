
const { courses, users } = require("./data");

module.exports = function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");

      return res.status(405).json({
        success: false,
        message: "Method not allowed. Use GET."
      });
    }

    const { courseId, instructorId, studentId } = req.query;
    let results = [...courses];

    if (courseId) {
      results = results.filter(
        (course) => String(course.id) === String(courseId)
      );
    }

    if (instructorId) {
      const instructor = users.find(
        (user) =>
          String(user.id) === String(instructorId) &&
          user.role === "instructor"
      );

      if (!instructor) {
        return res.status(404).json({
          success: false,
          message: "Instructor not found."
        });
      }

      results = results.filter(
        (course) =>
          String(course.instructorId) === String(instructorId)
      );
    }

    if (studentId) {
      const student = users.find(
        (user) =>
          String(user.id) === String(studentId) &&
          user.role === "student"
      );

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found."
        });
      }

      results = results.filter(
        (course) =>
          Array.isArray(course.studentIds) &&
          course.studentIds.some(
            (id) => String(id) === String(studentId)
          )
      );
    }

    const data = results.map((course) => {
      const instructor = users.find(
        (user) =>
          String(user.id) === String(course.instructorId)
      );

      return {
        ...course,
        instructorName: instructor
          ? instructor.name
          : "Unknown instructor",
        studentCount: Array.isArray(course.studentIds)
          ? course.studentIds.length
          : 0
      };
    });

    return res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error("Courses API error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve courses."
    });
  }
};

