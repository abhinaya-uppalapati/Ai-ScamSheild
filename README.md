# AI ScamShield

AI-powered multi-modal scam detection and investigation platform. Analyzes
suspicious messages, emails, and URLs using LLM-based detection, risk
scoring, evidence-based analysis, explainable AI, and a conversational
security assistant.

## Architecture

```
React Frontend (5173) → Node/Express Backend (5000) → Python FastAPI AI Service (8000) → MongoDB
```

## Project structure

```
AI-ScamShield/
├── frontend/       React + Vite + Tailwind + Recharts
├── backend/        Node.js + Express + MongoDB
├── ai-service/      Python + FastAPI + Anthropic API
├── docker-compose.yml
├── render.yaml       Render blueprint (backend + ai-service)
└── .github/workflows/ci.yml
```

## Getting started (local dev)

### 1. AI service (Python)

```bash
cd ai-service
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # add your ANTHROPIC_API_KEY
uvicorn app.main:app --reload --port 8000
```

### 2. Backend (Node)

```bash
cd backend
cp .env.example .env       # fill in MONGO_URI and JWT_SECRET
npm install
npm run dev
```

### 3. Frontend (React)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173, register an account, and scan a message like:

> "Congratulations! You won ₹50,000. Pay ₹999 to claim your prize."

### Or: run everything with Docker Compose

```bash
cp backend/.env.example backend/.env       # fill in real values
cp ai-service/.env.example ai-service/.env
docker compose up --build
```

## Feature map (roadmap milestones → code)

| Milestone | Feature | Where |
|---|---|---|
| 1 | Project foundation | root structure, this README |
| 2 | Authentication | `backend/src/{models/User.js, controllers/authController.js, middleware/auth.js}` |
| 3 | Dashboard | `frontend/src/pages/Dashboard.jsx` |
| 4 | Message scanner | `frontend/src/pages/Dashboard.jsx`, `backend .../scanController.js`, `ai-service .../routers/analyze.py` |
| 5–6 | Detection + risk scoring | `ai-service/app/services/llm_detector.py` (LLM-based), `detector.py` (rule-based fallback) |
| 7 | Explainable AI | `reasons` field returned by every analysis endpoint |
| 8 | Scam category detection | `category` field, categories listed in `llm_detector.py`'s system prompt |
| 9 | URL scanner | `frontend/src/pages/UrlScanner.jsx`, `POST /api/scans/url` |
| 10 | Email analyzer | `frontend/src/pages/EmailAnalyzer.jsx`, `POST /api/scans/email` |
| 11 | Investigation engine | `frontend/src/pages/Investigate.jsx`, `ai-service/app/services/investigation_service.py` |
| 12 | AI security assistant | `frontend/src/pages/Assistant.jsx`, `ai-service/app/services/assistant_service.py` |
| 13 | Scan history | `frontend/src/pages/History.jsx`, `GET /api/scans` |
| 14 | Analytics dashboard | `frontend/src/pages/Analytics.jsx`, `backend .../analyticsController.js` |
| 15 | User feedback | thumbs up/down buttons in `History.jsx`, `PATCH /api/scans/:id/feedback` |
| 16 | Admin panel | `frontend/src/pages/Admin.jsx`, `backend .../adminController.js` (role-gated) |
| 17 | Model evaluation | `ai-service/eval/evaluate.py` + `sample_labeled_dataset.csv` |
| 18 | Security hardening | helmet, rate limiting (incl. a stricter auth-specific limiter), bcrypt, JWT, enforced `express-validator` checks |
| 19 | Testing | `backend/tests/*.test.js` (Jest + Supertest), `ai-service/tests/*.py` (pytest), `.github/workflows/ci.yml` |
| 20 | Deployment | `docker-compose.yml`, `backend/Dockerfile`, `ai-service/Dockerfile`, `frontend/{Dockerfile,vercel.json}`, `render.yaml` |

## Honest status notes — read before your project demo

- **Detection is LLM-based** (`ai-service/app/services/llm_detector.py`) using
  the Anthropic API with a structured JSON prompt. If the LLM call fails for
  any reason (missing/invalid `ANTHROPIC_API_KEY`, network error, malformed
  response), every endpoint **silently falls back** to the original
  keyword-based `detector.py` so the product never goes fully down — but
  that also means low-quality fallback results can happen invisibly. Check
  your AI service logs (`[llm_detector] LLM call failed...`) if scores look
  off.
- **The investigation engine's evidence-fusion weights are heuristic**, not
  learned from data (see `investigation_service.py`). That's fine for a
  demo but say so if asked in your evaluation — don't present it as a
  trained fusion model.
- **`eval/sample_labeled_dataset.csv` has only 15 rows** and exists purely
  to prove the evaluation pipeline runs end-to-end (verified — the rule-
  based detector scores 80% accuracy on it, correctly computed). For
  Milestone 17's actual reported metrics, swap in a real dataset of at
  least a few hundred labeled examples with a proper held-out test split.
- **Tests were written and logic-verified during development** (10/10
  Python tests pass; backend Jest tests are present and use
  `mongodb-memory-server` plus mocked `axios` so they don't need live
  MongoDB/AI-service connections — run `npm test` in `backend/` to execute
  them yourself, since they weren't run inside the environment that
  generated this codebase).
- **Docker/Render/Vercel configs are provided but unexercised** — no live
  cloud deploy was performed while building this. Double-check env var
  names and ports against your actual Render/Vercel dashboards before
  relying on them.
- **Admin accounts**: there's no signup flow for admins on purpose (`role`
  defaults to `"user"`). Promote a user to admin manually in MongoDB
  (`db.users.updateOne({email: "..."}, {$set: {role: "admin"}})`) to access
  the Admin Panel.

## Running tests

```bash
# Backend
cd backend && npm install && npm test

# AI service
cd ai-service && pip install -r requirements.txt pytest && pytest -v

# Model evaluation (rule-based, no API key needed)
cd ai-service && python eval/evaluate.py --detector rule

# Model evaluation (LLM-based, needs ANTHROPIC_API_KEY)
cd ai-service && python eval/evaluate.py --detector llm
```
