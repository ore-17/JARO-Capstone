# JARO Capstone — Attendance Tracker

A web-based attendance tracking system developed as a capstone project. The goal is to help instructors manage course attendance and give students a straightforward way to view their attendance information.

> **Project status:** Early prototype. The current application includes a demo login and separate student and instructor dashboards. Course management, actual attendance recording, roster imports, and reporting are planned functionality, not yet implemented.

## Current features

- Login page with student and instructor demo accounts
- Role-based redirects to separate dashboards
- Student dashboard with sample course and attendance information
- Instructor dashboard with sample course information and attendance controls
- Basic navigation and logout behavior
- Test API endpoint for checking the server

**Note:** Dashboard data is currently illustrative, and some navigation links and buttons are placeholders.

## Technology stack

- **Frontend:** HTML, CSS, vanilla JavaScript
- **Backend:** Node.js, Express 5
- **Package manager:** npm
- **Deployment tooling:** Vercel is listed as a development dependency; deployment configuration should be verified before publishing.


## Project structure

```text
JARO-Capstone/
└── Attendance Tracker/
    ├── api/
    │   ├── Index.js             # Express app, test endpoint, demo login
    │   └── login.js             # Separate demo login handler
    ├── public/
    │   ├── index.html           # Login page
    │   ├── css/
    │   │   └── style.css        # Site styling
    │   ├── js/
    │   │   └── app.js           # Login form and redirects
    │   ├── student/
    │   │   └── dashboard.html   # Student dashboard
    │   └── instructor/
    │       └── dashboard.html   # Instructor dashboard
    ├── package.json
    ├── package-lock.json
    └── README.md
```

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) and npm
- Git (to clone the repository)
- A code editor such as Visual Studio Code

### 1. Clone the repository

```bash
git clone <YOUR-REPOSITORY-URL>
cd JARO-Capstone/"Attendance Tracker"
```

Replace `<YOUR-REPOSITORY-URL>` with your repository's HTTPS clone URL. If you already have the project on your computer, open the `Attendance Tracker` directory instead.

### 2. Install dependencies

```bash
npm install
```

### 3. Run the application
### 3. Run the Application

The project uses Node.js and Express to run the Attendance Tracker website locally.

**Step 1: Navigate to the project directory**

Open the terminal in VS Code and navigate to the folder containing `package.json`:

```bash
cd "Attendance Tracker"
```

**Step 2: Install dependencies**

```bash
npm install
```

**Step 3: Configure the server**

The root-level `server.js` starts the application:

```javascript
const app = require('./api/index');
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Attendance Tracker running at http://localhost:${port}`);
});
```

Ensure the `scripts` section in `package.json` contains:

```json
"scripts": {
    "start": "node server.js",
    "dev": "node server.js"
}
```

**Step 4: Start the application**

```bash
npm start
```

Once the server starts, open the following URL in your browser:

**http://localhost:3000**

To verify that the backend is functioning correctly, visit:

**http://localhost:3000/api/test**

The API should return a JSON response confirming that the Course Attendance API is working.

**Note:** The application currently uses temporary demo accounts for testing. Database integration and secure authentication are planned for future development.

Open **http://localhost:3000** in your browser.

## Demo accounts

These accounts are hardcoded for prototype testing only.

| Role | Email | Password |
|---|---|---|
| Student | `student@test.com` | `1234` |
| Instructor | `instructor@test.com` | `1234` |

**Security warning:** Demo credentials and plaintext passwords are not suitable for production. Do not use real student data or deploy this as a secure attendance system until authentication, authorization, and data storage are properly implemented.

## API endpoints

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/test` | Returns a basic API status message |
| `POST` | `/api/login` | Checks demo credentials and returns basic user information |

The login API is for demonstration only; it does not issue secure sessions or tokens.

## Planned functionality

- Create and manage multiple courses
- Import student rosters
- Create attendance sessions by course and date
- Record present/absent attendance, including a semi-automated check-in method
- Reduce fraudulent or duplicate check-ins
- Store and retrieve attendance history
- Generate configurable attendance reports
- Implement secure authentication and persistent storage

## Team workflow

To collaborate through GitHub:

```bash
# Get the latest changes
git pull

# Stage and commit your work
git add .
git commit -m "Describe your changes"

# Push your branch
git push
```

For team development, use feature branches and pull requests so changes can be reviewed before merging into the main branch.

## Known limitations

- No database or persistent attendance records yet
- Demo users are stored directly in source code
- Login state is kept in browser `localStorage` without secure server-side access control
- Some dashboard content, links, and controls are placeholders
- Local startup requires the fix described above
- The root route in `api/Index.js` references `public/login.html`, but the included login page is `public/index.html`; update that route to point to `index.html` before relying on it

## License

No license file is included in the supplied repository. Contact the project team before reusing or redistributing the code.
