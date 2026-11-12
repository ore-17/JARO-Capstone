
const { users } = require("./data");

module.exports = (req, res) => {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({
            success: false,
            message: "Method not allowed"
        });
    }

    const { email, password } = req.body || {};

    // All sample users in api/data.js share this temporary demo password.
    const user = users.find(
        item => item.email.toLowerCase() === String(email).toLowerCase()
    );

    if (!user || password !== "1234") {
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
            email: email,
            role: user.role
        }
    });
};
