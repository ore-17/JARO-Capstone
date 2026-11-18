(function () {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const courseSelect = document.getElementById("courseSelect");
    const sessionDate = document.getElementById("sessionDate");
    const sessionStartTime = document.getElementById("sessionStartTime");
    const sessionTopic = document.getElementById("sessionTopic");
    const searchInput = document.getElementById("studentSearch");
    const tableBody = document.getElementById("attendanceTableBody");
    const message = document.getElementById("message");
    const studentsById = new Map();
    let courses = [];
    let students = [];
    let records = [];

    if (!user || user.role !== "instructor") {
        window.location.replace("/");
        return;
    }

    const today = new Date();
    sessionDate.value = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    async function request(url, options) {
        const response = await fetch(url, options);
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "The request failed.");
        }

        return result.data;
    }

    async function loadCourses() {
        const data = await request(
            `/api/courses?instructorId=${encodeURIComponent(user.id)}`
        );
        courses = data || [];
        courseSelect.replaceChildren(new Option("Choose a course", ""));

        courses.forEach((course) => {
            courseSelect.add(
                new Option(`${course.code} - ${course.name}`, course.id)
            );
        });

        if (courses.length === 0) {
            courseSelect.replaceChildren(new Option("No courses found", ""));
            message.textContent = "No courses are assigned to your account.";
        } else {
            message.textContent = "Choose a course to load its students.";
        }
    }

    async function loadRoster() {
        const courseId = courseSelect.value;
        students = [];
        records = [];
        renderStudents();

        if (!courseId) return;

        message.textContent = "Loading enrolled students...";
        const roster = await request(
            `/api/students?courseId=${encodeURIComponent(courseId)}&instructorId=${encodeURIComponent(user.id)}`
        );

        if (courseSelect.value !== courseId) return;

        students = roster || [];
        students.forEach((student) => studentsById.set(student.id, student));

        if (students.length === 0) {
            message.textContent = "No students are enrolled in this course.";
            renderStudents();
            return;
        }

        await loadAttendance();
        message.textContent = "Students loaded. Mark attendance for the selected date.";
    }

    async function loadAttendance() {
        const courseId = courseSelect.value;
        const date = sessionDate.value;
        records = [];

        if (!courseId || !date) {
            renderStudents();
            return;
        }

        message.textContent = "Loading attendance...";
        const loadedRecords = await request(
            `/api/attendance?courseId=${encodeURIComponent(courseId)}&date=${encodeURIComponent(date)}&instructorId=${encodeURIComponent(user.id)}`
        ) || [];

        if (courseSelect.value !== courseId || sessionDate.value !== date) return;
        records = window.AttendanceStore.merge(loadedRecords).filter((record) =>
            String(record.courseId) === String(courseId) &&
            (record.date || record.sessionDate) === date
        );
        renderStudents();
        message.textContent = `${records.length} saved attendance records loaded.`;
    }

    function renderStudents() {
        const query = searchInput.value.trim().toLowerCase();
        tableBody.replaceChildren();

        const filtered = students.filter((student) =>
            String(student.name).toLowerCase().includes(query) ||
            String(student.id).toLowerCase().includes(query)
        );

        filtered.forEach((student) => {
            const row = document.createElement("tr");
            const idCell = document.createElement("td");
            const nameCell = document.createElement("td");
            const statusCell = document.createElement("td");
            const select = document.createElement("select");
            const currentRecord = records.find(
                (record) => record.studentId === student.id
            );

            idCell.textContent = student.id;
            nameCell.textContent = student.name;
            select.className = "status-select";
            select.dataset.studentId = student.id;
            select.setAttribute("aria-label", `Attendance status for ${student.name}`);

            [
                ["", "Select status"],
                ["present", "Present"],
                ["absent", "Absent"],
                ["late", "Late"],
                ["excused", "Excused"]
            ].forEach(([value, label]) => {
                select.add(new Option(label, value));
            });

            select.value = currentRecord ? currentRecord.status : "";
            select.addEventListener("change", updateSummary);
            statusCell.appendChild(select);
            row.append(idCell, nameCell, statusCell);
            tableBody.appendChild(row);
        });

        document.getElementById("emptyMessage").hidden = filtered.length > 0;
        updateSummary();
    }

    function updateSummary() {
        const statuses = [...tableBody.querySelectorAll(".status-select")]
            .map((select) => select.value);

        ["present", "absent", "excused", "late"].forEach((status) => {
            document.getElementById(`${status}Count`).textContent =
                statuses.filter((value) => value === status).length;
        });
        document.getElementById("unmarkedCount").textContent =
            statuses.filter((value) => !value).length;
    }

    function markDisplayed(status) {
        tableBody.querySelectorAll(".status-select").forEach((select) => {
            select.value = status;
        });
        updateSummary();
        message.textContent = `Displayed students marked ${status}. Save to submit.`;
    }

    async function saveAttendance() {
        const courseId = courseSelect.value;
        const date = sessionDate.value;
        const startTime = sessionStartTime.value;
        const topic = sessionTopic.value.trim();
        const selects = [...tableBody.querySelectorAll(".status-select")];

        if (!courseId || !date || !startTime || !topic) {
            message.textContent = "Choose a course and enter the attendance date, start time, and topic.";
            return;
        }

        if (students.length === 0) {
            message.textContent = "There are no enrolled students to mark.";
            return;
        }

        if (students.some((student) => {
            const select = selects.find((item) => item.dataset.studentId === student.id);
            const saved = records.find((record) => record.studentId === student.id);
            return !(select ? select.value : saved && saved.status);
        })) {
            message.textContent =
                "Mark every student in the course before saving attendance.";
            return;
        }

        const selectedCourse = courses.find((course) => course.id === courseId);
        message.textContent = "Saving attendance...";

        const results = await Promise.all(selects.map(async (select) => {
            const student = studentsById.get(select.dataset.studentId);
            return request("/api/attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    courseId,
                    date,
                    startTime,
                    topic,
                    studentId: student.id,
                    status: select.value,
                    instructorId: user.id
                })
            });
        }));

        records = results.map((record) => ({
            ...record,
            courseName: selectedCourse.name
        }));
        window.AttendanceStore.save(records);
        renderStudents();
        message.textContent = "Attendance saved successfully.";
        localStorage.setItem("lastAttendanceSaved", JSON.stringify({ courseId, date }));
        window.parent.postMessage({
            type: "attendance-saved",
            courseId,
            date
        }, window.location.origin);
    }

    document.getElementById("markAllPresent").addEventListener(
        "click",
        () => markDisplayed("present")
    );
    document.getElementById("markAllExcused").addEventListener(
        "click",
        () => markDisplayed("excused")
    );
    document.getElementById("saveAttendance").addEventListener(
        "click",
        () => saveAttendance().catch(showError)
    );
    courseSelect.addEventListener("change", () => loadRoster().catch(showError));
    sessionDate.addEventListener("change", () => loadAttendance().catch(showError));
    searchInput.addEventListener("input", renderStudents);

    function showError(error) {
        console.error("Attendance page error:", error);
        message.textContent = `Error: ${error.message}`;
    }

    window.logout = function () {
        localStorage.removeItem("user");
        window.location.href = "/";
    };

    loadCourses().catch(showError);
})();
