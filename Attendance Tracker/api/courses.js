
const { courses, users, sessions, attendanceRecords } = require("./data");

module.exports = function handler(req, res) {
  try {
    if (req.method === "GET") {
      return getCourses(req, res);
    }

    if (req.method === "POST") {
      return createCourse(req, res);
    }

    if (req.method === "PUT") {
      return updateCourse(req, res);
    }

    if (req.method === "DELETE") {
      return deleteCourse(req, res);
    }

    res.setHeader("Allow", "GET, POST, PUT, DELETE");

    return res.status(405).json({
      success: false,
      message: "Method not allowed."
    });
  } catch (error) {
    console.error("Courses API error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process courses request."
    });
  }
};

function getCourses(req, res) {
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
        (course) => String(course.instructorId) === String(instructorId)
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
          course.studentIds.some((id) => String(id) === String(studentId))
      );
    }

  const data = results.map((course) => {
      const instructor = users.find(
        (user) => String(user.id) === String(course.instructorId)
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
}

function createCourse(req, res) {
  const { code, name, term, instructorId } = req.body || {};

  if (
    typeof code !== "string" ||
    !code.trim() ||
    typeof name !== "string" ||
    !name.trim() ||
    typeof term !== "string" ||
    !term.trim() ||
    !instructorId
  ) {
    return res.status(400).json({
      success: false,
      message: "Course code, name, term, and instructorId are required."
    });
  }

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

  const normalizedCode = code.trim().toUpperCase();

  if (courses.some((course) => course.code.toUpperCase() === normalizedCode)) {
    return res.status(409).json({
      success: false,
      message: "A course with that code already exists."
    });
  }

  const course = {
    id: `course-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    code: normalizedCode,
    name: name.trim(),
    term: term.trim(),
    instructorId: instructor.id,
    instructorName: instructor.name,
    schedule: "",
    location: "",
    studentIds: []
  };

  courses.push(course);

  return res.status(201).json({
    success: true,
    message: "Course created.",
    data: { ...course, studentCount: 0 }
  });
}

function updateCourse(req, res) {
  const { courseId, code, name, term } = req.body || {};

  if (
    !courseId ||
    typeof code !== "string" ||
    !code.trim() ||
    typeof name !== "string" ||
    !name.trim() ||
    typeof term !== "string" ||
    !term.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "courseId, course code, name, and term are required."
    });
  }

  const course = courses.find(
    (item) => String(item.id) === String(courseId)
  );

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found."
    });
  }

  const normalizedCode = code.trim().toUpperCase();

  if (
    courses.some(
      (item) =>
        item.id !== course.id &&
        item.code.toUpperCase() === normalizedCode
    )
  ) {
    return res.status(409).json({
      success: false,
      message: "A course with that code already exists."
    });
  }

  course.code = normalizedCode;
  course.name = name.trim();
  course.term = term.trim();

  return res.status(200).json({
    success: true,
    message: "Course updated.",
    data: {
      ...course,
      studentCount: Array.isArray(course.studentIds)
        ? course.studentIds.length
        : 0
    }
  });
}

function deleteCourse(req, res) {
  const courseId = req.query.courseId;

  if (!courseId) {
    return res.status(400).json({
      success: false,
      message: "courseId is required."
    });
  }

  const courseIndex = courses.findIndex(
    (item) => String(item.id) === String(courseId)
  );

  if (courseIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Course not found."
    });
  }

  if (
    sessions.some((session) => session.courseId === courseId) ||
    attendanceRecords.some((record) => record.courseId === courseId)
  ) {
    return res.status(409).json({
      success: false,
      message: "Courses with sessions or attendance records cannot be deleted."
    });
  }

  courses.splice(courseIndex, 1);

  return res.status(200).json({
    success: true,
    message: "Course deleted."
  });
}

