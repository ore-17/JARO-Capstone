const instructorUser = JSON.parse(localStorage.getItem("user"));

// Get the dashboard elements.
const courseSelect = document.getElementById("courseSelect");
const courseCount = document.getElementById("courseCount");
const selectedCourseName = document.getElementById("selectedCourseName");
const courseDetails = document.getElementById("courseDetails");
const pageMessage = document.getElementById("pageMessage");

// Store the courses returned by the API.
let instructorCourses = [];

// Load the instructor's courses.
async function loadInstructorCourses() {
    // Check that an instructor is logged in.
    if (
        !instructorUser ||
        instructorUser.role !== "instructor"
    ) {
        window.location.href = "/";
        return;
    }

    try {
        pageMessage.textContent = "Loading your courses...";
        courseCount.textContent = "--";
        courseSelect.replaceChildren();

        // Request courses assigned to this instructor.
        const response = await fetch(
            `/api/courses?instructorId=${encodeURIComponent(instructorUser.id)}`
        );

        const result = await response.json();

        // Handle API errors.
        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Unable to load courses."
            );
        }

        instructorCourses = result.data || [];

        // Update the course count.
        courseCount.textContent = instructorCourses.length;

        // Handle an instructor with no assigned courses.
        if (instructorCourses.length === 0) {
            courseSelect.add(
                new Option("No courses found", "")
            );

            selectedCourseName.textContent = "None";
            courseDetails.textContent =
                "No courses are currently assigned to you.";

            pageMessage.textContent = "No courses found.";
            return;
        }

        // Add a default option.
        courseSelect.add(
            new Option("Choose a course", "")
        );

        // Add each assigned course to the dropdown.
        instructorCourses.forEach((course) => {
            const option = new Option(
                `${course.code} - ${course.name}`,
                course.id
            );

            courseSelect.add(option);
        });

        pageMessage.textContent =
            "Your courses loaded successfully.";

    } catch (error) {
        console.error("Instructor dashboard error:", error);

        courseCount.textContent = "--";
        courseSelect.replaceChildren(
            new Option("Unable to load courses", "")
        );

        selectedCourseName.textContent = "None";
        courseDetails.textContent =
            "Your courses could not be loaded.";

        pageMessage.textContent =
            `Error: ${error.message}`;
    }
}

// Display details when a course is selected.
courseSelect.addEventListener("change", function () {
    const courseId = courseSelect.value;

    // Reset the details if no course is selected.
    if (!courseId) {
        selectedCourseName.textContent = "None";
        courseDetails.textContent =
            "Choose a course to view its details.";
        return;
    }

    // Find the selected course.
    const course = instructorCourses.find(
        (item) => item.id === courseId
    );

    if (!course) {
        selectedCourseName.textContent = "None";
        courseDetails.textContent =
            "Course details could not be found.";
        return;
    }

    // Update the selected course name.
    selectedCourseName.textContent =
        `${course.code} - ${course.name}`;

    // Clear old details.
    courseDetails.replaceChildren();

    // Display course information.
    const details = [
        ["Course Name", course.name],
        ["Course Code", course.code],
        ["Term", course.term],
        ["Instructor", course.instructorName],
        ["Schedule", course.schedule],
        ["Location", course.location],
        ["Enrolled Students", course.studentCount]
    ];

    details.forEach(([label, value]) => {
        const paragraph = document.createElement("p");
        const strong = document.createElement("strong");

        strong.textContent = `${label}: `;
        paragraph.appendChild(strong);
        paragraph.appendChild(
            document.createTextNode(
                value === undefined || value === null
                    ? "Not available"
                    : String(value)
            )
        );

        courseDetails.appendChild(paragraph);
    });
});

// Start the dashboard.
loadInstructorCourses();