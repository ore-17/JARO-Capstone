(function () {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const tableBody = document.getElementById("coursesTableBody");
    const emptyMessage = document.getElementById("emptyMessage");
    const searchInput = document.getElementById("searchInput");
    const termFilter = document.getElementById("termFilter");
    const courseModal = document.getElementById("courseModal");
    const courseForm = document.getElementById("courseForm");
    const statusMessage = document.getElementById("statusMessage");
    let courses = [];

    if (!user || user.role !== "instructor") {
        window.location.replace("/");
        return;
    }

    async function request(url, options) {
        const response = await fetch(url, options);
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || "The request failed.");
        }
        return result.data;
    }

    async function loadCourses() {
        statusMessage.textContent = "Loading your courses...";
        courses = await request(
            `/api/courses?instructorId=${encodeURIComponent(user.id)}`
        ) || [];
        renderCourses();
        statusMessage.textContent = `${courses.length} courses loaded.`;
    }

    function renderCourses() {
        const query = searchInput.value.trim().toLowerCase();
        const term = termFilter.value;
        const filtered = courses.filter((course) =>
            `${course.code} ${course.name}`.toLowerCase().includes(query) &&
            (!term || course.term === term)
        );

        tableBody.replaceChildren();
        filtered.forEach((course) => {
            const row = document.createElement("tr");
            [
                course.code,
                course.name,
                course.term,
                String(course.studentCount || 0)
            ].forEach((value) => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            const actionsCell = document.createElement("td");
            const actions = document.createElement("div");
            actions.className = "course-actions";
            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "secondary-button";
            editButton.textContent = "Edit";
            editButton.addEventListener("click", () => openCourseForm(course));
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "secondary-button";
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", () => deleteCourse(course));
            actions.append(editButton, deleteButton);
            actionsCell.appendChild(actions);
            row.appendChild(actionsCell);
            tableBody.appendChild(row);
        });
        emptyMessage.hidden = filtered.length > 0;
    }

    function openCourseForm(course) {
        courseForm.reset();
        document.getElementById("courseId").value = course ? course.id : "";
        document.getElementById("modalTitle").textContent =
            course ? "Edit Course" : "Add Course";
        if (course) {
            document.getElementById("courseCode").value = course.code;
            document.getElementById("courseName").value = course.name;
            document.getElementById("courseTerm").value = course.term;
        }
        courseModal.style.display = "flex";
        document.getElementById("courseCode").focus();
    }

    function closeCourseForm() {
        courseModal.style.display = "none";
    }

    async function deleteCourse(course) {
        if (!window.confirm(`Delete ${course.code} - ${course.name}?`)) return;
        try {
            await request(
                `/api/courses?courseId=${encodeURIComponent(course.id)}`,
                { method: "DELETE" }
            );
            await loadCourses();
            statusMessage.textContent = "Course deleted.";
        } catch (error) {
            showError(error);
        }
    }

    courseForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const courseId = document.getElementById("courseId").value;
        const payload = {
            code: document.getElementById("courseCode").value.trim(),
            name: document.getElementById("courseName").value.trim(),
            term: document.getElementById("courseTerm").value,
            instructorId: user.id
        };
        try {
            await request("/api/courses", {
                method: courseId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(courseId ? { ...payload, courseId } : payload)
            });
            closeCourseForm();
            await loadCourses();
            statusMessage.textContent = courseId ? "Course updated." : "Course added.";
        } catch (error) {
            showError(error);
        }
    });

    function showError(error) {
        console.error("Course management error:", error);
        statusMessage.textContent = `Error: ${error.message}`;
    }

    searchInput.addEventListener("input", renderCourses);
    termFilter.addEventListener("change", renderCourses);
    courseModal.addEventListener("click", (event) => {
        if (event.target === courseModal) closeCourseForm();
    });
    window.openCourseForm = () => openCourseForm(null);
    window.closeCourseForm = closeCourseForm;
    window.logout = function () {
        localStorage.removeItem("user");
        window.location.href = "/";
    };

    loadCourses().catch(showError);
})();
