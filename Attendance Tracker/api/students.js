const { courses, users } = require("./data");

module.exports = function handler(req, res) {
    try {
        // Only allow GET requests.
        if (req.method !== "GET") {
            res.setHeader("Allow", "GET");

            return res.status(405).json({
                success: false,
                message: "Method not allowed. Use GET."
            });
        }

        const { courseId, instructorId } = req.query;

        // Make sure both IDs are provided.
        if (!courseId || !instructorId) {
            return res.status(400).json({
                success: false,
                message: "Course ID and instructor ID are required."
            });
        }

        // Find the instructor.
        const instructor = users.find(user =>
            String(user.id) === String(instructorId) &&
            user.role === "instructor"
        );

        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: "Instructor not found."
            });
        }

        // Find the selected course.
        const course = courses.find(course =>
            String(course.id) === String(courseId)
        );

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found."
            });
        }

        // Make sure the course belongs to this instructor.
        if (String(course.instructorId) !== String(instructorId)) {
            return res.status(403).json({
                success: false,
                message: "You are not assigned to this course."
            });
        }

        // Get the student IDs enrolled in the course.
        const studentIds = Array.isArray(course.studentIds)
            ? course.studentIds
            : [];

        // Retrieve the actual student records.
        const students = users
            .filter(user =>
                user.role === "student" &&
                studentIds.some(id =>
                    String(id) === String(user.id)
                )
            )
            .map(student => ({
                id: student.id,
                name: student.name,
                email: student.email
            }));

        // Return the student records.
        return res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });

    } catch (error) {
        console.error("Students API error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve students."
        });
    }
};
