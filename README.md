# E:Revive – A Smart E-Waste Management System

React + Vite frontend and Spring Boot backend. Users sign up, assess an electronic item (with an optional photo), get a reuse/recycle recommendation with value and environmental estimates, schedule a pickup, and track eco points on a dashboard.

```
E-Revive/
├── frontend/      React + Vite app        → hosted on GitHub Pages
├── backend/       Spring Boot API (Java 17) → hosted on Render (Docker)
├── render.yaml    Render blueprint for the backend
└── .github/workflows/deploy-frontend.yml   builds & publishes the frontend
```

**Live architecture**

| Part | Host | Notes |
|---|---|---|
| Frontend | GitHub Pages | Static site, rebuilt on every push to `main` |
| Backend API | Render (free web service) | Sleeps after 15 min idle; first request then takes up to ~1 min |
| Database | Neon PostgreSQL (free plan) | Data persists; 1 GB storage per project |

---

## Run locally

Requirements: Node.js 18+, Java 17+, Maven 3.6.3+.

### Backend

```powershell
cd backend
mvn.cmd spring-boot:run
```

The API starts at `http://localhost:8080`. With no `DATABASE_URL` set it uses an embedded H2 database stored in `backend/data/erevive.mv.db` (no setup needed).

To run locally against PostgreSQL instead, set `DATABASE_URL` first:

```powershell
$env:DATABASE_URL = "postgresql://user:password@host/dbname?sslmode=require"
mvn.cmd spring-boot:run
```

### Frontend

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:5173`. The frontend calls `http://localhost:8080/api` by default; to point it elsewhere copy `.env.example` to `.env` and set `VITE_API_URL`.

---

## Configuration

**Backend environment variables**

| Variable | Required in production | Example |
|---|---|---|
| `DATABASE_URL` | Yes | `postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require` |
| `ALLOWED_ORIGINS` | Yes | `https://jananis-27.github.io` (comma-separated; origin only, no path) |
| `PORT` | Set by Render | `8080` |

When `DATABASE_URL` is set, the backend converts it to a JDBC URL and creates the tables from `schema-postgres.sql` on startup (tables are only created if missing; data is never dropped).

**Frontend build variables** (set in GitHub, not in code)

| Variable | Where | Example |
|---|---|---|
| `VITE_API_URL` | Repo → Settings → Secrets and variables → Actions → **Variables** | `https://erevive-api.onrender.com/api` |
| `VITE_BASE_PATH` | Set automatically by the workflow | `/E-Revive-Smart-E-Waste-Management/` |

The frontend uses hash-based URLs (`…/#/dashboard`) so pages can be refreshed or bookmarked on GitHub Pages without 404 errors.

---

## Deploy (one-time setup)

### 1. Database – Neon
1. Sign up at https://neon.com and create a project (choose an AWS Asia Pacific (Singapore) region).
2. Copy the **connection string** (`postgresql://…?sslmode=require…`). Keep it private.

### 2. Backend – Render
1. Sign up at https://render.com with your GitHub account.
2. **New → Blueprint**, select this repository. Render reads `render.yaml`.
3. When asked for `DATABASE_URL`, paste the Neon connection string. Click **Apply**.
4. Wait for the deploy, then open `https://<service-name>.onrender.com/api/health` – it should show `"status":"UP"`.
5. If your GitHub Pages address differs from `https://jananis-27.github.io`, update `ALLOWED_ORIGINS` in the Render service's **Environment** tab.

### 3. Frontend – GitHub Pages
1. Repo → **Settings → Pages** → Source: **GitHub Actions**.
2. Repo → **Settings → Secrets and variables → Actions → Variables** → add `VITE_API_URL` = `https://<service-name>.onrender.com/api`.
3. Repo → **Actions** → *Deploy frontend to GitHub Pages* → **Run workflow** (it also runs on every push to `main` that changes `frontend/`).
4. The site appears at `https://jananis-27.github.io/E-Revive-Smart-E-Waste-Management/`.

> GitHub Pages needs a **public** repository on a free GitHub plan.

---

## API routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Backend health check |
| POST | `/api/auth/register`, `/api/auth/login` | Create an account and start a session |
| POST | `/api/survey` | Submit questionnaire answers and an optional image (`multipart/form-data`) |
| GET | `/api/analyses/{id}` | Retrieve a saved assessment and estimate |
| GET | `/api/analyses/{id}/image` | Retrieve the image saved with an assessment |
| POST | `/api/pickups` | Save a pickup booking linked to an assessment |
| GET | `/api/dashboard` | Retrieve persisted assessments, pickups, and totals |

## Notes and known limitations

- Reuse/recycle decisions use server-side questionnaire scoring with indicative, category-based value and environmental estimates. No trained ML model is included.
- Password-reset email is not configured (`/api/auth/forgot-password` returns "not configured").
- Uploaded images (up to 10 MB each) are stored in the database, so they count toward Neon's 1 GB free storage.
- On Windows PowerShell, use the `.cmd` command names above to avoid script execution-policy issues.
