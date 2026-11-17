(function () {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const courseFilter = document.getElementById("courseFilter");
    const startDate = document.getElementById("startDate");
    const endDate = document.getElementById("endDate");
    const studentSearch = document.getElementById("studentSearch");
    const studentSummaryBody = document.getElementById("studentSummaryBody");
    const historyBody = document.getElementById("historyBody");
    const message = document.getElementById("message");
    let courses = [];
    let records = [];

    if (!user || user.role !== "instructor") {
        window.location.replace("/");
        return;
    }

    async function request(url) {
        const response = await fetch(url);
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "The request failed.");
        }

        return result.data;
    }

    async function loadReports() {
        message.textContent = "Loading attendance records...";

        courses = await request(
            `/api/courses?instructorId=${encodeURIComponent(user.id)}`
        ) || [];

        courseFilter.replaceChildren(new Option("All Courses", "all"));
        courses.forEach((course) => {
            courseFilter.add(
                new Option(`${course.code} - ${course.name}`, course.id)
            );
        });

        const attendanceByCourse = await Promise.all(
            courses.map((course) =>
                request(`/api/attendance?courseId=${encodeURIComponent(course.id)}`)
            )
        );
        records = attendanceByCourse.flat();
        renderReports();
    }

    function getFilteredRecords() {
        const selectedCourse = courseFilter.value;
        const from = startDate.value;
        const to = endDate.value;

        if (from && to && from > to) {
            message.textContent = "Start date cannot be after end date.";
            return null;
        }

        return records.filter((record) => (
            (selectedCourse === "all" || record.courseId === selectedCourse) &&
            (!from || record.sessionDate >= from) &&
            (!to || record.sessionDate <= to)
        ));
    }

    function updateSummary(filteredRecords) {
        const counts = { present: 0, absent: 0, excused: 0, late: 0 };

        filteredRecords.forEach((record) => {
            const status = String(record.status).toLowerCase();
            if (Object.prototype.hasOwnProperty.call(counts, status)) {
                counts[status]++;
            }
        });

        document.getElementById("totalCount").textContent = filteredRecords.length;
        Object.entries(counts).forEach(([status, count]) => {
            document.getElementById(`${status}Count`).textContent = count;
        });
    }

    function updateStudentSummary(filteredRecords) {
        const search = studentSearch.value.trim().toLowerCase();
        const students = new Map();

        filteredRecords.forEach((record) => {
            const id = String(record.studentId);
            if (!students.has(id)) {
                students.set(id, {
                    id,
                    name: record.studentName || "Unknown student",
                    present: 0,
                    absent: 0,
                    excused: 0,
                    late: 0
                });
            }
            const student = students.get(id);
            const status = String(record.status).toLowerCase();
            if (Object.prototype.hasOwnProperty.call(student, status)) {
                student[status]++;
            }
        });

        const visibleStudents = [...students.values()].filter((student) =>
            student.name.toLowerCase().includes(search) ||
            student.id.toLowerCase().includes(search)
        );
        studentSummaryBody.replaceChildren();
        document.getElementById("emptyStudents").hidden = visibleStudents.length > 0;

        visibleStudents.forEach((student) => {
            const row = document.createElement("tr");
            const attendedSessions = student.present + student.absent + student.late;
            const percentage = attendedSessions
                ? ((student.present + student.late) / attendedSessions) * 100
                : null;
            [
                student.id,
                student.name,
                student.present,
                student.absent,
                student.excused,
                student.late
            ].forEach((value) => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            const rateCell = document.createElement("td");
            rateCell.textContent = percentage === null
                ? "N/A"
                : `${percentage.toFixed(1)}%`;
            if (percentage !== null && percentage < 75) {
                rateCell.className = "warning";
                rateCell.textContent += " - Low";
            } else if (percentage !== null) {
                rateCell.className = "good";
            }
            row.appendChild(rateCell);
            studentSummaryBody.appendChild(row);
        });
    }

    function updateHistory(filteredRecords) {
        const sortedRecords = [...filteredRecords].sort((a, b) =>
            String(b.sessionDate).localeCompare(String(a.sessionDate))
        );
        historyBody.replaceChildren();
        document.getElementById("emptyHistory").hidden = sortedRecords.length > 0;

        sortedRecords.forEach((record) => {
            const row = document.createElement("tr");
            [
                record.sessionDate,
                record.courseName,
                record.studentId,
                record.studentName,
                record.status
            ].forEach((value, index) => {
                const cell = document.createElement("td");
                cell.textContent = value || "";
                if (index === 4) cell.className = String(value).toLowerCase();
                row.appendChild(cell);
            });
            historyBody.appendChild(row);
        });
    }

    function renderReports() {
        const filteredRecords = getFilteredRecords();
        if (filteredRecords === null) return;

        updateSummary(filteredRecords);
        updateStudentSummary(filteredRecords);
        updateHistory(filteredRecords);
        message.textContent = filteredRecords.length
            ? `${filteredRecords.length} attendance records found.`
            : "No attendance records found for these filters.";
    }

    function showError(error) {
        console.error("Attendance reports error:", error);
        message.textContent = `Error loading reports: ${error.message}`;
    }

    [courseFilter, startDate, endDate].forEach((element) => {
        element.addEventListener("change", renderReports);
    });
    studentSearch.addEventListener("input", renderReports);

    window.logout = function () {
        localStorage.removeItem("user");
        window.location.href = "/";
    };

    loadReports().catch(showError);
})();
