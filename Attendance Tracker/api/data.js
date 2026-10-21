
/*
 * api/data.js
 *
 * SAMPLE DATA FOR DEVELOPMENT ONLY.
 * Replace this in-memory data with a database before production.
 */

const courses = [
  {
    id: "CSCE-1030",
    code: "CSCE 1030",
    name: "Computer Science I",
    term: "Fall 2026",
    instructorId: "instructor-1001",
    instructorName: "Dr. Sarah Johnson",
    schedule: "Monday and Wednesday, 10:00 AM",
    location: "Discovery Park B185",
    studentIds: ["student-1001", "student-1002", "student-1003"]
  },
  {
    id: "CSCE-2110",
    code: "CSCE 2110",
    name: "Computer Science II",
    term: "Fall 2026",
    instructorId: "instructor-1002",
    instructorName: "Professor Michael Lee",
    schedule: "Tuesday and Thursday, 1:00 PM",
    location: "Discovery Park B155",
    studentIds: ["student-1001", "student-1002"]
  }
];

const users = [
  {
    id: "student-1001",
    name: "Alex Carter",
    email: "alex@example.com",
    role: "student"
  },
  {
    id: "student-1002",
    name: "Jordan Smith",
    email: "jordan@example.com",
    role: "student"
  },
  {
    id: "student-1003",
    name: "Taylor Brown",
    email: "taylor@example.com",
    role: "student"
  },
  {
    id: "instructor-1001",
    name: "Dr. Sarah Johnson",
    email: "sarah@example.com",
    role: "instructor"
  },
  {
    id: "instructor-1002",
    name: "Professor Michael Lee",
    email: "michael@example.com",
    role: "instructor"
  }
];

const sessions = [
  {
    id: "session-1030-001",
    courseId: "CSCE-1030",
    date: "2026-10-19",
    startTime: "10:00",
    topic: "Introduction to Programming"
  },
  {
    id: "session-1030-002",
    courseId: "CSCE-1030",
    date: "2026-10-21",
    startTime: "10:00",
    topic: "Variables and Data Types"
  },
  {
    id: "session-2110-001",
    courseId: "CSCE-2110",
    date: "2026-10-20",
    startTime: "13:00",
    topic: "Object-Oriented Programming"
  }
];

const attendanceRecords = [
  {
    id: "att-1001",
    courseId: "CSCE-1030",
    sessionId: "session-1030-001",
    studentId: "student-1001",
    status: "present",
    notes: "",
    recordedBy: "instructor-1001",
    updatedAt: "2026-10-19T15:00:00.000Z"
  },
  {
    id: "att-1002",
    courseId: "CSCE-1030",
    sessionId: "session-1030-001",
    studentId: "student-1002",
    status: "late",
    notes: "Arrived after class began",
    recordedBy: "instructor-1001",
    updatedAt: "2026-10-19T15:05:00.000Z"
  },
  {
    id: "att-1003",
    courseId: "CSCE-1030",
    sessionId: "session-1030-001",
    studentId: "student-1003",
    status: "absent",
    notes: "",
    recordedBy: "instructor-1001",
    updatedAt: "2026-10-19T15:00:00.000Z"
  },
  {
    id: "att-1004",
    courseId: "CSCE-2110",
    sessionId: "session-2110-001",
    studentId: "student-1001",
    status: "present",
    notes: "",
    recordedBy: "instructor-1002",
    updatedAt: "2026-10-20T18:00:00.000Z"
  }
];

module.exports = {
  courses,
  users,
  sessions,
  attendanceRecords
};
