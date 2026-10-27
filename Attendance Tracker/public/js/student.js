const studentUser = JSON.parse(localStorage.getItem("user"));

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
        const response = await fetch(
            `/api/courses?studentId=${encodeURIComponent(studentUser.id)}`
        );

        const result = await response.json();

        // Handle unsuccessful API responses.
        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Unable to load your courses."
            );
        }

        const courses = result.data || [];

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

// Start loading the dashboard.
loadStudentDashboard();

async function loadAttendance() {
    const student = JSON.parse(localStorage.getItem("user"));

    if (!student || student.role !== "student" || !student.id) {
        return;
    }

    const tableBody = document.getElementById("attendanceTableBody");

    if (!tableBody) {
        return;
    }

    try {
        // Get attendance records from the backend
        const response = await fetch(
            `/api/attendance?studentId=${encodeURIComponent(student.id)}`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Unable to load attendance."
            );
        }

        if (!Array.isArray(result.data)) {
            throw new Error("Invalid attendance data.");
        }

        const records = result.data;

        // Count attendance statuses
        const present = records.filter(
            record => record.status === "present"
        ).length;

        const absent = records.filter(
            record => record.status === "absent"
        ).length;

        const late = records.filter(
            record => record.status === "late"
        ).length;

        // Temporary attendance policy:
        // Late counts as attended, excused is excluded.
        const totalCounted = present + absent + late;

        const rate = totalCounted > 0
            ? Math.round(((present + late) / totalCounted) * 100)
            : null;

        // Update dashboard statistics
        document.getElementById("presentCount").textContent = present;
        document.getElementById("absentCount").textContent = absent;
        document.getElementById("attendanceRate").textContent =
            rate === null ? "N/A" : `${rate}%`;

        // Clear existing table rows
        tableBody.replaceChildren();

        if (records.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 3;
            cell.textContent = "No attendance records found.";

            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }

        // Sort by date, newest first
        records.sort((a, b) =>
            (b.sessionDate || "").localeCompare(a.sessionDate || "")
        );

        // Display attendance records
        records.forEach(record => {
            const row = document.createElement("tr");

            const courseCell = document.createElement("td");
            courseCell.textContent = record.courseName;

            const dateCell = document.createElement("td");
            dateCell.textContent = record.sessionDate || "N/A";

            const statusCell = document.createElement("td");
            statusCell.textContent = record.status;
            statusCell.className = record.status;

            row.append(courseCell, dateCell, statusCell);
            tableBody.appendChild(row);
        });

        // Update Reports section
        const reportMessage = document.getElementById("reportMessage");

        if (reportMessage) {
            reportMessage.textContent =
                `Attendance Rate: ${rate === null ? "N/A" : rate + "%"} | ` +
                `Present: ${present} | Late: ${late} | Absent: ${absent}`;
        }

    } catch (error) {
        console.error("Error loading attendance:", error);

        document.getElementById("attendanceRate").textContent = "N/A";
        document.getElementById("presentCount").textContent = "--";
        document.getElementById("absentCount").textContent = "--";

        tableBody.replaceChildren();

        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 3;
        cell.textContent = "Unable to load attendance records.";
        row.appendChild(cell);
        tableBody.appendChild(row);
    }
}

// Load attendance when the dashboard opens
loadAttendance();