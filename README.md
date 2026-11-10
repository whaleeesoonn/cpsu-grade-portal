# CPSU Digital Grading Management System (Vue 3)

Front-end for the Digital Grading Management System of Central Philippines State University, San Carlos Campus.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in /dist
```

Requires Node.js 20.19 or newer (Vite 8).

## Deploy on Vercel

The project already includes `vercel.json`, so no settings need to be changed.

**Option A: Git (recommended)**
1. Push this folder to a GitHub repository.
2. In Vercel, choose **Add New > Project** and import the repository.
3. Click **Deploy**. Vercel detects Vite, runs `npm run build`, and serves `dist`.

**Option B: Vercel CLI**
```bash
npm i -g vercel
vercel --prod
```

There is no router and no environment variables, so no rewrite rules are needed.

## Demo accounts

| Role          | Username | Password   |
|---------------|----------|------------|
| Administrator | admin    | admin123   |
| Faculty       | faculty  | faculty123 |
| Student       | student  | student123 |

You can also register new accounts. Registering as a Student creates an empty student record.

## What follows the flowcharts

- **Registration**: complete/valid check -> username already registered? -> create account -> save -> success, then go to Login.
- **Login**: fields complete/valid? -> verify credentials -> identify role -> redirect to the dashboard.

## Pages and role access

| Page                | Student     | Faculty | Administrator |
|---------------------|-------------|---------|---------------|
| Dashboard analytics | own results | class   | class         |
| Student Information | no          | view    | add / edit / remove |
| Grades              | read only   | edit    | edit          |

## Notes

This is a front-end only prototype. Accounts and grades are kept in the browser's localStorage and passwords are SHA-256 hashed in the browser. A real deployment needs a backend API and database for authentication and records. See `src/stores/` for the code to replace.

Navigation is plain Vue state (no vue-router): `src/App.vue` switches between Login, Register and the dashboard, and `src/views/DashboardLayout.vue` switches between its three pages.

Structure: `src/views` (pages), `src/components` (shared UI), `src/stores` (auth and data), `public/cpsu-logo.png` (university seal).
