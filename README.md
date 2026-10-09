# ❤️ HeartGuard AI — Heart Disease Risk Prediction Platform

<img width="1902" height="915" alt="image" src="https://github.com/user-attachments/assets/8e95d29c-bb74-455a-85b8-92e5c73b1be3" />


> **Understand Your Heart Risk. Make Better Health Decisions.**
<img width="1917" height="920" alt="image" src="https://github.com/user-attachments/assets/eb7b086b-4e9b-498a-8962-28a41a8d1c21" />


A full-stack healthcare SaaS-style web app. Users create an account, complete a short health assessment, and receive an **educational** heart-risk estimate from a simple Logistic Regression model. They can track history, view charts, and download PDF reports. Admins manage users and assessments.

> **Medical disclaimer.** HeartGuard AI provides an educational risk estimate based on the information provided. It is not a medical diagnosis and should not replace professional medical advice.

## Features

**For users**
<img width="1911" height="922" alt="image" src="https://github.com/user-attachments/assets/2c38664f-7a99-4222-9a20-220d48497a09" />


- **Account:** register and log in with email and password (password strength meter, client and server validation), "remember me", change password, edit name and email, delete account.
- **Health assessment:** a four-section form (personal information, health measurements, heart information, lifestyle and profile) with units, tooltips ("Why do we ask this?"), min/max validation and toggle/radio controls.

<img width="1898" height="922" alt="image" src="https://github.com/user-attachments/assets/7e905e8c-a8f7-4ab1-8dca-fd32b828dc90" />

  
- **Risk estimate:** the model's probability shown as a percentage on a Low / Moderate / Higher meter, with careful wording ("estimated risk", never "you have heart disease").
- **Factors to consider:** plain-language notes generated from the values entered, for example blood pressure above the commonly used reference range.
- **Safety notices:** a red notice for very high readings (blood pressure of 180 or more, cholesterol of 300 or more, fasting sugar of 126 or more) and an amber notice when age or heart rate falls outside the range the model learned from. They sit beside the estimate and never change it.
<img width="1911" height="922" alt="image" src="https://github.com/user-attachments/assets/cb90f20d-5a22-45bf-aa9c-eb7e8f312010" />
  

  
- **Dashboard:** greeting, stat cards (total, low risk, higher risk, last assessment), a risk-overview donut chart, a trend line chart and a recent-assessments table.

<img width="1913" height="917" alt="image" src="https://github.com/user-attachments/assets/bc6c8daf-f324-46be-bc35-5ad95edbb3c8" />


  
- **History:** filter by risk level, search by date or result, sort (newest, oldest, highest risk), view details, download PDF, delete.

<img width="1905" height="911" alt="image" src="https://github.com/user-attachments/assets/0ae5ab68-9c68-4226-bf85-8a61e1f5b04f" />

  
- **Assessment details:** inputs, prediction, probability, factors and insights on one page.
<img width="1913" height="923" alt="image" src="https://github.com/user-attachments/assets/0b70477d-55b4-4b9e-a5cc-7b2cf0b50b21" />

  
- **PDF reports:** branded report with user name, date, inputs, estimate, notes, insights and the medical disclaimer.

<img width="621" height="832" alt="image" src="https://github.com/user-attachments/assets/f43bac0a-5cfc-4f2d-ac62-152de84c4562" />

  
- **Reports page:** every assessment with a one-click PDF download.
- **Health insights:** short educational cards on blood pressure, cholesterol, heart rate, physical activity, smoking and healthy lifestyle.
<img width="1882" height="917" alt="image" src="https://github.com/user-attachments/assets/fbff8e90-302c-4418-9b13-88946007dad1" />


**For administrators**
- **Admin dashboard:** total users, total assessments, low and higher risk counts, 30-day assessment trend, risk distribution and recent assessments.
- **User management:** search, view details and assessment count, activate or deactivate, delete (non-admin users only).
- **Assessment management:** search by user, filter by risk level and date range, view details, delete inappropriate records.
- Admins cannot deactivate or delete their own account, and public sign-up can never create an admin.

**Interface and quality**
- Custom CSS design system (variables, buttons, cards, badges, alerts, forms), no Tailwind.
- Responsive from desktop to 360px: sidebar becomes a drawer, tables become stacked cards, forms go single column.
- Loading skeletons, error states with "Try again", empty states with a call to action, toast notifications (no `alert()`).
- Accessibility: labelled inputs, error messages tied to fields, keyboard-friendly dialogs and tooltips, visible focus states, reduced-motion support.

## Functions and how they work

| Area | Function | What it does |
| --- | --- | --- |
| Auth | `register` / `login` (`authController`) | Validates input, hashes the password with bcrypt, returns a JWT. Login uses one generic error for unknown email and wrong password. |
| Auth | `protect` / `adminOnly` (`middleware/auth.js`) | Verifies the JWT, loads the user, blocks deactivated accounts and non-admins. |
| Assessment | `assessmentService.create` | Maps the form to model inputs, calls the ML service, converts the probability into a level and saves it. |
| ML bridge | `mlService.predict` | Calls `POST /predict` on the FastAPI service with a long timeout and one retry for cold starts. Returns a 503 with a friendly message if the service is down. |
| Risk | `levelFromProbability` | Low below 33%, Moderate 33-65%, Higher 66% and above. |
| Insights | `buildFactors`, `buildInsights`, `buildWarnings` | Generate educational explanations, general tips and safety notices from the stored inputs (computed on read, not stored). |
| Analytics | `userDashboard`, `adminStatistics` | Totals, distributions, trends and recent items from real database records. |
| PDF | `streamReport` (`pdfService`) | Streams a formatted PDF for one assessment, owner-only. |
| Client | `api.js` | Single Axios instance using `VITE_API_URL`, attaches the token, signs the user out on an expired session. |
| Client | `useFetch` | Loads data and exposes `data`, `loading`, `error` and `reload` for every page's three states. |
| ML | `train_model.py` | Loads data, cleans it, tunes regularisation with 5-fold cross-validation, evaluates on a held-out split and on cross-validation, saves the model and metrics. |
| ML | `POST /predict` | Returns the probability and a label for the 8 model inputs. |

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
* Metrics (accuracy, precision, recall, F1, ROC-AUC) are computed by `train_model.py` on a held-out split **and** with 5-fold cross-validation, and printed when you train. Nothing is hardcoded. With about 300 rows, trust the cross-validated numbers more than the small test split.
* The model can under-react to some single readings (for example very high blood pressure in a young patient), and it is unreliable outside ages 29-77. The app adds safety notices for these cases instead of altering the model.

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
