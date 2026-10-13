const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());

// Serve the frontend files
app.use(express.static(path.join(__dirname, "../public")));

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/login.html"));
});

// Test API
app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Course Attendance API is working!"
    });
});

// Temporary user data
const users = [
    {
        id: 1,
        name: "Raymond Bassina",
        email: "student@test.com",
        password: "1234",
        role: "student"
    },
    {
        id: 2,
        name: "Professor Smith",
        email: "instructor@test.com",
        password: "1234",
        role: "instructor"
    }
];

// Temporary login API
app.post("/api/login", (req, res) => {

    const { email, password } = req.body;

    const user = users.find(
        user =>
            user.email === email &&
            user.password === password
    );

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password."
        });
    }

    res.json({
        success: true,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
});

module.exports = app;

// Start the server locally
if (require.main === module) {
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.log(`Attendance Tracker running at http://localhost:${PORT}`);
    });
}