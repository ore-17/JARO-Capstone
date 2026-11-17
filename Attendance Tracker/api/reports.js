const { courses, users, sessions, attendanceRecords } = require("./data");

const VALID_STATUSES = ["present", "absent", "late", "excused"];

module.exports = function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      success: false,
      message: "Method not allowed. Use GET."
    });
  }

  const { instructorId, courseId, studentId, startDate, endDate } = req.query;

  if (!instructorId) {
    return res.status(400).json({
      success: false,
      message: "instructorId is required."
    });
  }

  const instructor = users.find(
    (user) => String(user.id) === String(instructorId) && user.role === "instructor"
  );

  if (!instructor) {
    return res.status(404).json({ success: false, message: "Instructor not found." });
  }

  if ((startDate && !isDate(startDate)) || (endDate && !isDate(endDate))) {
    return res.status(400).json({
      success: false,
      message: "startDate and endDate must use YYYY-MM-DD format."
    });
  }

  if (startDate && endDate && startDate > endDate) {
    return res.status(400).json({
      success: false,
      message: "startDate cannot be after endDate."
    });
  }

  const instructorCourses = courses.filter(
    (course) => String(course.instructorId) === String(instructor.id)
  );

  if (courseId && !instructorCourses.some((course) => String(course.id) === String(courseId))) {
    const courseExists = courses.some((course) => String(course.id) === String(courseId));
    return res.status(courseExists ? 403 : 404).json({
      success: false,
      message: courseExists ? "You are not assigned to this course." : "Course not found."
    });
  }

  if (studentId && !users.some(
    (user) => String(user.id) === String(studentId) && user.role === "student"
  )) {
    return res.status(404).json({ success: false, message: "Student not found." });
  }

  const allowedCourseIds = new Set(
    instructorCourses
      .filter((course) => !courseId || String(course.id) === String(courseId))
      .map((course) => String(course.id))
  );

  const data = attendanceRecords
    .filter((record) => allowedCourseIds.has(String(record.courseId)))
    .filter((record) => !studentId || String(record.studentId) === String(studentId))
    .map((record) => {
      const student = users.find((user) => String(user.id) === String(record.studentId));
      const course = courses.find((item) => String(item.id) === String(record.courseId));
      const session = sessions.find((item) => String(item.id) === String(record.sessionId));

      return {
        ...record,
        studentName: student ? student.name : "Unknown student",
        courseName: course ? course.name : "Unknown course",
        courseCode: course ? course.code : null,
        sessionDate: session ? session.date : null,
        sessionTopic: session ? session.topic : null
      };
    })
    .filter((record) => (!startDate || record.sessionDate >= startDate))
    .filter((record) => (!endDate || record.sessionDate <= endDate));

  const summary = data.reduce((counts, record) => {
    const status = String(record.status).toLowerCase();
    if (Object.prototype.hasOwnProperty.call(counts, status)) counts[status]++;
    counts.total++;
    return counts;
  }, { total: 0, present: 0, absent: 0, late: 0, excused: 0 });

  return res.status(200).json({ success: true, count: data.length, summary, data });
};

function isDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)) &&
    new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;
}
