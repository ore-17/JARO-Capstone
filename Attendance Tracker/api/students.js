
const { users, courses } = require("./data");

module.exports = function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      success: false,
      message: "Method not allowed. Use GET."
    });
  }

  const { id, courseId } = req.query;

  let students = users.filter(user => user.role === "student");

  if (id) {
    students = students.filter(student => student.id === id);
  }

  if (courseId) {
    const course = courses.find(course => course.id === courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found."
      });
    }

    students = students.filter(student =>
      course.studentIds.includes(student.id)
    );
  }

  if (id && students.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Student not found."
    });
  }

  return res.status(200).json({
    success: true,
    count: students.length,
    data: students
  });
};
