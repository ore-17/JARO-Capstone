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