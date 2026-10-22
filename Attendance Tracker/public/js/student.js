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