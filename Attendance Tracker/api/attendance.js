
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
  const { courseId, sessionId, studentId } = req.query;

  if (courseId && !courses.some((c) => c.id === courseId)) {
    return res.status(404).json({
      success: false,
      message: "Course not found."
    });
  }

  if (sessionId && !sessions.some((s) => s.id === sessionId)) {
    return res.status(404).json({
      success: false,
      message: "Class session not found."
    });
  }

  if (studentId && !users.some(
    (u) => u.id === studentId && u.role === "student"
  )) {
    return res.status(404).json({
      success: false,
      message: "Student not found."
    });
  }

  let results = attendanceRecords;

  if (courseId) {
    results = results.filter((r) => r.courseId === courseId);
  }

  if (sessionId) {
    results = results.filter((r) => r.sessionId === sessionId);
  }

  if (studentId) {
    results = results.filter((r) => r.studentId === studentId);
  }

  // Add readable names to each record for the frontend.
  const data = results.map((record) => {
    const student = users.find((u) => u.id === record.studentId);
    const course = courses.find((c) => c.id === record.courseId);
    const session = sessions.find((s) => s.id === record.sessionId);

    return {
      ...record,
      studentName: student ? student.name : "Unknown student",
      courseName: course ? course.name : "Unknown course",
      sessionDate: session ? session.date : null,
      sessionTopic: session ? session.topic : null
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
    studentId,
    status,
    instructorId,
    notes = ""
  } = req.body || {};

  // Validate required fields.
  if (
    !courseId ||
    !sessionId ||
    !studentId ||
    !status ||
    !instructorId
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Required fields: courseId, sessionId, studentId, status, instructorId."
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

  const course = courses.find((c) => c.id === courseId);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found."
    });
  }

  const session = sessions.find(
    (s) => s.id === sessionId && s.courseId === courseId
  );

  if (!session) {
    return res.status(404).json({
      success: false,
      message: "Session not found for this course."
    });
  }

  const student = users.find(
    (u) => u.id === studentId && u.role === "student"
  );

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student not found."
    });
  }

  if (!course.studentIds.includes(studentId)) {
    return res.status(400).json({
      success: false,
      message: "This student is not enrolled in the course."
    });
  }

  const instructor = users.find(
    (u) => u.id === instructorId && u.role === "instructor"
  );

  if (!instructor || course.instructorId !== instructorId) {
    return res.status(403).json({
      success: false,
      message: "Instructor is not assigned to this course."
    });
  }

  const now = new Date().toISOString();

  // Update the existing record, or create a new one.
  const existingRecord = attendanceRecords.find(
    (r) =>
      r.courseId === courseId &&
      r.sessionId === sessionId &&
      r.studentId === studentId
  );

  let record;

  if (existingRecord) {
    existingRecord.status = status;
    existingRecord.notes = notes.trim();
    existingRecord.recordedBy = instructorId;
    existingRecord.updatedAt = now;
    record = existingRecord;
  } else {
    record = {
      id: `att-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      courseId,
      sessionId,
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
      sessionDate: session.date,
      sessionTopic: session.topic
    }
  });
}
