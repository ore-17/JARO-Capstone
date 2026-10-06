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

module.exports = (req, res) => {

    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method not allowed"
        });
    }

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

    return res.status(200).json({
        success: true,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
};