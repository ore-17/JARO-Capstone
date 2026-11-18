
const {
  courses,
  users,
  sessions,
  attendanceRecords
} = require("./data");

const VALID_STATUSES = [
  "present",
  "absent",
  "late",
  "excused"
];

module.exports = function handler(req, res) {
  if (req.method === "GET") {
    return getAttendance(req, res);
  }

  if (req.method === "POST") {
    return recordAttendance(req, res);
  }

  res.setHeader("Allow", "GET, POST");

  return res.status(405).json({
    success: false,
    message: "Method not allowed. Use GET or POST."
  });
};

function getAttendance(req, res) {
  const { courseId, sessionId, studentId, instructorId, date } = req.query;
  let instructorCourseIds = null;

  if (instructorId) {
    const instructor = users.find(
      (u) => String(u.id) === String(instructorId) && u.role === "instructor"
    );
    if (!instructor) {
      return res.status(404).json({ success: false, message: "Instructor not found." });
    }
    instructorCourseIds = new Set(courses
      .filter((course) => String(course.instructorId) === String(instructorId))
      .map((course) => String(course.id)));
    const scopedCourseId = courseId || sessions.find((s) => String(s.id) === String(sessionId))?.courseId;
    if (scopedCourseId) {
      const course = courses.find((c) => String(c.id) === String(scopedCourseId));
      if (!course) return res.status(404).json({ success: false, message: "Course not found." });
      if (String(course.instructorId) !== String(instructorId)) {
        return res.status(403).json({ success: false, message: "You are not assigned to this course." });
      }
    }
  }

  if (courseId && !courses.some((c) => String(c.id) === String(courseId))) {
    return res.status(404).json({
      success: false,
      message: "Course not found."
    });
  }

  if (sessionId && !sessions.some((s) => String(s.id) === String(sessionId))) {
    return res.status(404).json({
      success: false,
      message: "Class session not found."
    });
  }

  if (studentId && !users.some(
    (u) => String(u.id) === String(studentId) && u.role === "student"
  )) {
    return res.status(404).json({
      success: false,
      message: "Student not found."
    });
  }

  let results = attendanceRecords;

  if (instructorCourseIds) {
    results = results.filter((record) => instructorCourseIds.has(String(record.courseId)));
  }

  if (courseId) {
    results = results.filter((r) => String(r.courseId) === String(courseId));
  }

  if (sessionId) {
    results = results.filter((r) => String(r.sessionId) === String(sessionId));
  }

  if (studentId) {
    results = results.filter((r) => String(r.studentId) === String(studentId));
  }

  if (date) {
    results = results.filter((record) => {
      const session = sessions.find((item) => String(item.id) === String(record.sessionId));
      return (record.date || (session && session.date)) === date;
    });
  }

  // Add readable names to each record for the frontend.
  const data = results.map((record) => {
    const student = users.find((u) => String(u.id) === String(record.studentId));
    const course = courses.find((c) => String(c.id) === String(record.courseId));
    const session = sessions.find((s) => String(s.id) === String(record.sessionId));

    return {
      ...record,
      studentName: student ? student.name : "Unknown student",
      courseName: course ? course.name : "Unknown course",
      sessionDate: record.date || (session ? session.date : null),
      sessionTopic: record.topic || (session ? session.topic : null)
    };
  });

  return res.status(200).json({
    success: true,
    count: data.length,
    data
  });
}

function recordAttendance(req, res) {
  const {
    courseId,
    sessionId,
    date,
    startTime = "",
    topic = "",
    studentId,
    status,
    instructorId,
    notes = ""
  } = req.body || {};

  // Validate required fields.
  if (
    !courseId ||
    (!sessionId && !date) ||
    !studentId ||
    !status ||
    !instructorId
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Required fields: courseId, date or sessionId, studentId, status, instructorId."
    });
  }

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Status must be one of: ${VALID_STATUSES.join(", ")}.`
    });
  }

  if (typeof notes !== "string" || notes.length > 500) {
    return res.status(400).json({
      success: false,
      message: "Notes must be text no longer than 500 characters."
    });
  }

  const course = courses.find((c) => String(c.id) === String(courseId));

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found."
    });
  }

  const session = sessionId && sessions.find(
    (s) => String(s.id) === String(sessionId) && String(s.courseId) === String(courseId)
  );
  if (sessionId && !session) {
    return res.status(404).json({
      success: false,
      message: "Session not found for this course."
    });
  }

  const attendanceDate = date || (session && session.date);
  const attendanceTopic = topic || (session && session.topic) || "";
  if (
    typeof attendanceDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(attendanceDate) ||
    Number.isNaN(Date.parse(`${attendanceDate}T00:00:00.000Z`)) ||
    new Date(`${attendanceDate}T00:00:00.000Z`).toISOString().slice(0, 10) !== attendanceDate ||
    (startTime && !/^\d{2}:\d{2}$/.test(startTime))
  ) {
    return res.status(400).json({ success: false, message: "A valid attendance date and start time are required." });
  }

  const student = users.find(
    (u) => String(u.id) === String(studentId) && u.role === "student"
  );

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student not found."
    });
  }

  if (!course.studentIds.some((id) => String(id) === String(studentId))) {
    return res.status(400).json({
      success: false,
      message: "This student is not enrolled in the course."
    });
  }

  const instructor = users.find(
    (u) => String(u.id) === String(instructorId) && u.role === "instructor"
  );

  if (!instructor || String(course.instructorId) !== String(instructorId)) {
    return res.status(403).json({
      success: false,
      message: "Instructor is not assigned to this course."
    });
  }

  const now = new Date().toISOString();

  // Update the existing record, or create a new one.
  const existingRecord = attendanceRecords.find(
    (r) =>
      String(r.courseId) === String(courseId) &&
      (sessionId
        ? String(r.sessionId) === String(sessionId)
        : (r.date || sessions.find((item) => String(item.id) === String(r.sessionId))?.date) === attendanceDate) &&
      String(r.studentId) === String(studentId)
  );

  let record;

  if (existingRecord) {
    existingRecord.status = status;
    existingRecord.notes = notes.trim();
    existingRecord.recordedBy = instructorId;
    existingRecord.date = attendanceDate;
    existingRecord.startTime = startTime;
    existingRecord.topic = attendanceTopic;
    existingRecord.updatedAt = now;
    record = existingRecord;
  } else {
    record = {
      id: `att-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      courseId,
      ...(sessionId ? { sessionId } : {}),
      date: attendanceDate,
      startTime,
      topic: attendanceTopic,
      studentId,
      status,
      notes: notes.trim(),
      recordedBy: instructorId,
      updatedAt: now
    };

    attendanceRecords.push(record);
  }

  return res.status(existingRecord ? 200 : 201).json({
    success: true,
    message: existingRecord
      ? "Attendance updated."
      : "Attendance recorded.",
    data: {
      ...record,
      studentName: student.name,
      courseName: course.name,
      sessionDate: attendanceDate,
      sessionTopic: attendanceTopic
    }
  });
}
