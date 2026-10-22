
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

    // Temporary demo credentials for testing.
    const demoAccounts = {
        "student@test.com": {
            password: "1234",
            dataEmail: "alex@example.com"
        },
        "instructor@test.com": {
            password: "1234",
            dataEmail: "sarah@example.com"
        }
    };

    const account = demoAccounts[email];

    if (!account || account.password !== password) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password."
        });
    }

    const user = users.find(
        item => item.email === account.dataEmail
    );

    if (!user) {
        return res.status(500).json({
            success: false,
            message: "Demo user was not found in the data file."
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
