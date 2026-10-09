# ❤️ HeartGuard AI — Heart Disease Risk Prediction Platform

> **Understand Your Heart Risk. Make Better Health Decisions.**

A full-stack healthcare SaaS-style web app. Users create an account, complete a short health assessment, and receive an **educational** heart-risk estimate from a simple Logistic Regression model. They can track history, view charts, and download PDF reports. Admins manage users and assessments.

> **Medical disclaimer.** HeartGuard AI provides an educational risk estimate based on the information provided. It is not a medical diagnosis and should not replace professional medical advice.

## Architecture

```
User ─▶ Vercel (React + Vite) ─▶ Render (Node/Express API) ─▶ MongoDB Atlas
                                          │
                                          └──────────────────▶ Render (Python FastAPI ML service)
```

The browser never talks to MongoDB or the ML service directly.

| Folder | What it is |
| --- | --- |
| `client/` | React 18 + Vite, React Router, Axios, Recharts, plain CSS design system (no Tailwind) |
| `server/` | Express, Mongoose, JWT, bcryptjs, Helmet, CORS, rate limiting, express-validator, PDFKit |
| `ml-service/` | FastAPI + scikit-learn Logistic Regression trained on the UCI Heart Disease (Cleveland) dataset |

Server layout: `config/ controllers/ models/ routes/ middleware/ services/ utils/ validators/ scripts/`.
Client CSS lives in `client/src/css/` (`variables`, `global`, `components`, `landing`, `auth`, `dashboard`, `assessment`, `result`, `history`, `profile`, `admin`, `responsive`).

## The model — what it does and does not use

Trained on the **UCI Heart Disease (processed Cleveland, 303 rows)** dataset, target = any heart disease (`num > 0`).

Features (all collected in the assessment form): `age`, `sex`, `cp` (chest pain type), `trestbps` (resting blood pressure), `chol`, `fbs` (fasting blood sugar > 120 mg/dL), `thalach` (**maximum** heart rate), `exang` (exercise-induced angina).

Honest notes:

* **Resting heart rate is not collected**, because the dataset has no such column. The form asks for *maximum* heart rate instead.
* **BMI, smoking, alcohol and physical activity are not in the dataset.** They are stored as optional profile information and labelled *"Not used in the estimate"* in the UI and PDF.
* Risk bands applied to the probability: **Low < 33%, Moderate 33–65%, Higher ≥ 66%**.
* The dataset is small and old. Treat the output as a demonstration of integrating a simple model, not as clinical guidance.
* Metrics (accuracy, precision, recall, F1, ROC-AUC) are computed by `train_model.py` on a held-out split and printed when you train. Nothing is hardcoded.

## Local development

Prerequisites: Node 18+, Python 3.10+, a MongoDB Atlas cluster (or local MongoDB).

### 1. ML service

```bash
cd ml-service
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python training/train_model.py                      # downloads dataset, trains, prints metrics, saves model/
uvicorn app.main:app --reload --port 8000
```

Check: `curl http://localhost:8000/health`. If the automatic download fails, download `processed.cleveland.data` from the UCI repository and follow the message printed by the script.

### 2. Backend

```bash
cd server
cp .env.example .env     # fill in MONGODB_URI, JWT_SECRET (32+ chars), ML_SERVICE_URL=http://localhost:8000, CLIENT_URL=http://localhost:5173
npm install
npm run dev
```

### 3. Frontend

```bash
cd client
cp .env.example .env     # leave VITE_API_URL empty locally (Vite proxies /api to localhost:5000) or set http://localhost:5000/api
npm install
npm run dev
```

Open http://localhost:5173.

### How the three services communicate

1. React calls the Express API using the centralised Axios instance in `client/src/services/api.js` (`import.meta.env.VITE_API_URL`) and sends the JWT in the `Authorization` header.
2. Express validates the request, calls `POST {ML_SERVICE_URL}/predict`, converts the probability into a risk level, and saves the assessment in MongoDB.
3. Express returns the saved assessment (plus educational factors) to React.

### Optional demo data

With the ML service running:

```bash
cd server
SEED_ADMIN_PASSWORD='choose-one-1' SEED_DEMO_PASSWORD='choose-two-2' npm run seed
```

Creates `admin@demo.heartguard.local` and `user@demo.heartguard.local` (flagged **Demo** in the admin panel) plus five sample assessments whose predictions come from the real model. Without the env vars, random passwords are generated and printed once. In production the passwords are mandatory. Re-running replaces only demo data.

To create a real admin: register normally, then in Atlas set that user's `role` to `admin`.

## Deployment (Vercel + Render + MongoDB Atlas)

### Step 1 — Push to GitHub

```bash
cd heartguard-ai
git init && git add . && git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<you>/heartguard-ai.git
git push -u origin main
```

`.gitignore` already excludes `node_modules`, `.env`, `__pycache__`, `*.pyc`, build output and generated model files.

### Step 2 — MongoDB Atlas

1. Create a free cluster at https://cloud.mongodb.com.
2. **Database Access** → add a database user with a strong password (read/write on any database).
3. **Network Access** → add an IP access entry. Render free web services do not have fixed outbound IPs, so use `0.0.0.0/0` and rely on a strong DB password (or use a paid Render plan with static IPs and allow-list them).
4. **Connect → Drivers** → copy the `mongodb+srv://…` string and replace `<password>`; add a database name, e.g. `…mongodb.net/heartguard?retryWrites=true&w=majority`.
5. You will add this as `MONGODB_URI` on Render (Step 4).

### Step 3 — Deploy the ML service to Render

Either use the Blueprint (`render.yaml`: **New → Blueprint**) or create a **Web Service** manually:

* Root directory: `ml-service`
* Build command: `pip install -r requirements.txt && python training/train_model.py`
* Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
* Env: `PYTHON_VERSION=3.11.9`, `MODEL_PATH=model/heart_model.joblib`
* Health check path: `/health`

The model is trained during the build (the build step downloads the public dataset and prints the metrics in the build log). Copy the service URL, e.g. `https://heartguard-ml.onrender.com`.

### Step 4 — Deploy the Node backend to Render

* Root directory: `server`
* Build command: `npm install` · Start command: `npm start`
* Health check path: `/api/health`
* Env vars:

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Atlas connection string |
| `JWT_SECRET` | 32+ random characters (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
| `ML_SERVICE_URL` | URL from Step 3 (no trailing slash) |
| `CLIENT_URL` | your Vercel URL (set after Step 5; may be comma-separated) |

The server listens on `process.env.PORT`.

### Step 5 — Deploy the React frontend to Vercel

* Import the repo, set **Root Directory** to `client` (framework: Vite).
* Env var: `VITE_API_URL=https://<your-backend>.onrender.com/api`
* `client/vercel.json` rewrites all paths to `index.html`, so React Router deep links work.

### Step 6 — Update CORS

On the Render backend set `CLIENT_URL` to the exact Vercel origin (e.g. `https://heartguard.vercel.app`, no trailing slash, no path) and redeploy. For preview deployments add extra origins separated by commas. `http://localhost:5173` is only allowed when `NODE_ENV` is not `production`.

### Step 7 — Test the live system

Register → Login → New assessment → Result → History (filter/search/delete) → Dashboard charts → Download PDF → Profile → Admin (promote a user in Atlas, then check `/admin`, `/admin/users`, `/admin/assessments`).

> **Free-tier cold starts:** Render free services sleep after inactivity. The first assessment can take ~50 seconds while the ML service wakes up. The UI warns about this and the API client waits up to 70 s.

## API reference

All responses are JSON `{ success, … }`. Errors: `{ success: false, message, errors? }`. Protected routes need `Authorization: Bearer <token>`.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | – | `{name,email,password}` → `{token,user}` (role is always `user`) |
| POST | `/api/auth/login` | – | `{email,password}` → `{token,user}` |
| GET | `/api/auth/me` | user | current user |
| PUT | `/api/auth/profile` | user | `{name?,email?}` |
| PUT | `/api/auth/change-password` | user | `{currentPassword,newPassword}` |
| DELETE | `/api/auth/me` | user | `{password}` deletes account + assessments |
| POST | `/api/assessments` | user | create (calls ML service) → assessment with `factors`, `insights` |
| GET | `/api/assessments` | user | query: `risk=Low|Moderate|Higher`, `sort=newest|oldest|highest` |
| GET | `/api/assessments/:id` | user | one (owner only) |
| GET | `/api/assessments/:id/pdf` | user | PDF report |
| DELETE | `/api/assessments/:id` | user | delete (owner only) |
| GET | `/api/analytics/dashboard` | user | totals, distribution, trend, recent |
| GET | `/api/admin/statistics` | admin | platform totals, 30-day trend, distribution, recent |
| GET | `/api/admin/users` | admin | query: `search`, `status=active|inactive` (includes `assessmentCount`) |
| GET | `/api/admin/users/:id` | admin | user + latest assessments |
| PUT | `/api/admin/users/:id/status` | admin | `{isActive}` |
| DELETE | `/api/admin/users/:id` | admin | non-admin users only |
| GET | `/api/admin/assessments` | admin | query: `risk`, `from`, `to`, `userId`, `search` (user name/email) |
| GET | `/api/admin/assessments/:id` | admin | one with factors |
| DELETE | `/api/admin/assessments/:id` | admin | delete |
| GET | `/api/health` | – | liveness |

ML service: `GET /health`, `POST /predict` with `{age,sex,cp,trestbps,chol,fbs,thalach,exang}` → `{prediction, probability}`. Field names match the training dataset; the Node service maps the form fields onto them (`server/services/mlService.js`).

## Security notes

JWT auth, bcrypt (cost 12), admin-only routes, express-validator on every write, Helmet, origin-restricted CORS (`CLIENT_URL`), global and per-route rate limits, 10 KB body limit, no stack traces in production responses, owner-scoped assessment queries, generic login errors, secrets only via environment variables.

## Known limitations

* **Password reset by email is not implemented** (needs an email provider). `/forgot-password` explains this and points to *Profile → Change password*.
* **Privacy / Terms / Contact** pages contain template text; replace before a public launch.
* No automated test suite is included.
* Tokens are stored in `localStorage`/`sessionStorage` (simple for a portfolio app; an httpOnly-cookie flow is stronger for production).
