let studentUser = null;
try {
    studentUser = JSON.parse(localStorage.getItem("user") || "null");
} catch (error) {
    localStorage.removeItem("user");
}

async function requestStudentData(url) {
    const response = await fetch(url, { cache: "no-store" });
    const result = await response.json();
    if (!response.ok || !result.success) {
        throw new Error(result.message || "The request failed.");
    }
    return Array.isArray(result.data) ? result.data : [];
}

// Get the dashboard elements.
const dashboardMessage = document.getElementById("dashboardMessage");
const courseList = document.getElementById("courseList");
const courseCount = document.getElementById("courseCount");

// Load the student's dashboard.
async function loadStudentDashboard() {
    // Make sure a student is logged in.
    if (!studentUser || studentUser.role !== "student") {
        window.location.href = "/";
        return;
    }

    try {
        dashboardMessage.textContent = "Loading your dashboard...";
        courseList.textContent = "Loading courses...";

        // Request courses belonging to this student.
        const courses = await requestStudentData(
            `/api/courses?studentId=${encodeURIComponent(studentUser.id)}`
        );

        // Update the number of courses.
        courseCount.textContent = courses.length;

        // Clear the existing course list.
        courseList.replaceChildren();

        // Display a message if no courses are assigned.
        if (courses.length === 0) {
            courseList.textContent =
                "No courses found for your account.";
        } else {
            // Create a card for each course.
            courses.forEach((course) => {
                const card = document.createElement("div");
                card.className = "card";

                const title = document.createElement("h3");
                title.textContent =
                    `${course.code} - ${course.name}`;

                const instructor = document.createElement("p");
                instructor.textContent =
                    `Instructor: ${course.instructorName}`;

                const schedule = document.createElement("p");
                schedule.textContent =
                    `Schedule: ${course.schedule}`;

                const location = document.createElement("p");
                location.textContent =
                    `Location: ${course.location}`;

                card.append(
                    title,
                    instructor,
                    schedule,
                    location
                );

                courseList.appendChild(card);
            });
        }

        dashboardMessage.textContent =
            "Your courses loaded successfully.";

    } catch (error) {
        console.error("Student dashboard error:", error);

        dashboardMessage.textContent =
            `Error loading dashboard: ${error.message}`;

        courseList.textContent =
            "Could not load courses. Please check the connection and try again.";

        courseCount.textContent = "--";
    }
}

async function loadStudentAttendance() {
    const reportMessage = document.getElementById("reportMessage");
    const tableBody = document.getElementById("attendanceTableBody");

    if (!studentUser || studentUser.role !== "student") {
        return;
    }

    try {
        const serverRecords = await requestStudentData(
            `/api/attendance?studentId=${encodeURIComponent(studentUser.id)}`
        );
        const records = window.AttendanceStore.merge(serverRecords).filter((record) =>
            String(record.studentId) === String(studentUser.id)
        );
        const statusOf = (record) => String(record.status).toLowerCase();
        const present = records.filter(
            (record) => statusOf(record) === "present"
        ).length;
        const late = records.filter(
            (record) => statusOf(record) === "late"
        ).length;
        const absent = records.filter(
            (record) => statusOf(record) === "absent"
        ).length;
        const counted = present + late + absent;
        const rate = counted > 0
            ? `${(((present + late * 0.8) / counted) * 100).toFixed(1)}%`
            : "N/A";

        document.getElementById("presentCount").textContent = present;
        document.getElementById("absentCount").textContent = absent;
        document.getElementById("attendanceRate").textContent = rate;

        tableBody.replaceChildren();
        records
            .slice()
            .sort((a, b) =>
                String(b.sessionDate).localeCompare(String(a.sessionDate))
            )
            .forEach((record) => {
                const row = document.createElement("tr");
                [record.courseName, record.sessionDate, record.status]
                    .forEach((value) => {
                        const cell = document.createElement("td");
                        cell.textContent = value || "";
                        row.appendChild(cell);
                    });
                tableBody.appendChild(row);
            });

        if (records.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 3;
            cell.textContent = "No attendance records found.";
            row.appendChild(cell);
            tableBody.appendChild(row);
        }

        reportMessage.textContent =
            `${records.length} attendance records. Attendance rate: ${rate}.`;
    } catch (error) {
        console.error("Student attendance error:", error);
        reportMessage.textContent =
            `Error loading attendance report: ${error.message}`;
        tableBody.replaceChildren();
        document.getElementById("attendanceRate").textContent = "--";
        document.getElementById("presentCount").textContent = "--";
        document.getElementById("absentCount").textContent = "--";
    }
}

// Start loading the dashboard.
loadStudentDashboard();
loadStudentAttendance();

// Refresh attendance when the student returns to an already-open dashboard.
window.addEventListener("focus", loadStudentAttendance);
