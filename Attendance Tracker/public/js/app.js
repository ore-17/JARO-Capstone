const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const email =
            document.getElementById("email").value;

        const password =
            document.getElementById("password").value;

        const message =
            document.getElementById("loginMessage");

        try {

            const response = await fetch("/api/login", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })

            });

            const data = await response.json();

            if (!response.ok) {

                message.textContent = data.message;

                return;
            }

            // Save user information temporarily
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            // Redirect based on role
            if (data.user.role === "student") {

                window.location.href =
                    "/student/dashboard.html";

            } else if (data.user.role === "instructor") {

                window.location.href =
                    "/instructor/dashboard.html";
            }

        } catch (error) {

            console.error(error);

            message.textContent =
                "Something went wrong. Please try again.";

        }

    });

}

/**
 * Fetch courses from the backend API.
 *
 * Examples:
 * loadCourses({ studentId: "student-1001" });
 * loadCourses({ instructorId: "instructor-1001" });
 */
async function loadCourses(filters = {}) {
    const params = new URLSearchParams();

    if (filters.courseId) {
        params.set("courseId", filters.courseId);
    }

    if (filters.studentId) {
        params.set("studentId", filters.studentId);
    }

    if (filters.instructorId) {
        params.set("instructorId", filters.instructorId);
    }

    const query = params.toString();
    const url = query
        ? `/api/courses?${query}`
        : "/api/courses";

    const response = await fetch(url);
    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not load courses.");
    }

    return result.data;
}
