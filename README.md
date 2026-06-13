# SmartRail - AI Powered Railway Management

AI-powered railway operations backend built with **FastAPI**, **PostgreSQL**, **Redis**, **Celery**, and **SQLAlchemy**. Includes delay prediction (XGBoost), smart ticket reallocation, real-time WebSockets, analytics, and a keyword-based chatbot.

A React frontend (Vite) lives in `src/` and connects to this API on `http://localhost:8000`.

---

## Prerequisites

| Service    | Version | Purpose                          |
|-----------|---------|----------------------------------|
| Python    | 3.11+   | API, Celery worker, ML           |
| PostgreSQL| 14+     | Primary database                 |
| Redis     | 6+      | Celery broker & result backend   |
| Node.js   | 18+     | React frontend (optional)        |

---

## Quick Start

### 1. Clone and create a virtual environment

```bash
cd SmartRail
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

### 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Copy and edit `.env` in the project root:

```env
# Application
APP_NAME=Railway Management System API
DEBUG=true

# PostgreSQL
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/railway_db

# Redis
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# JWT
SECRET_KEY=change-me-in-production-use-a-long-random-string

# CORS — React dev server (Vite default: 5173)
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]

# Notifications (optional)
TWILIO_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
SENDGRID_KEY=
SENDGRID_FROM_EMAIL=
```

Environment variables are loaded via **python-dotenv** (`load_dotenv()` in `main.py` and `app/core/config.py`) and **pydantic-settings**.

### 4. Create the PostgreSQL database

```bash
createdb railway_db
# or via psql:
# CREATE DATABASE railway_db;
```

Tables are created automatically on API startup (`Base.metadata.create_all`).

### 5. Train the delay prediction model

```bash
python scripts/train_delay_model.py
```

This writes `models/delay_model.pkl` used by `POST /api/trains/predict-delay`.

### 6. Start Redis

```bash
# Docker
docker run -d --name redis -p 6379:6379 redis:7

# or local Redis service
redis-server
```

### 7. Run the API

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- API: http://localhost:8000  
- Swagger docs: http://localhost:8000/docs  

### 8. Run the Celery worker

In a **second terminal** (with the same venv and `.env`):

```bash
celery -A celery_worker.celery_app worker --loglevel=info
```

Verify Redis connectivity:

```bash
celery -A celery_worker.celery_app inspect ping
```

The worker uses `CELERY_BROKER_URL` and `CELERY_RESULT_BACKEND` from `.env` (Redis DB 1 and 2 by default).

### 9. Run the React frontend (optional)

```bash
npm install
npm run dev
```

Frontend: http://localhost:5173 (included in `CORS_ORIGINS`).

---

## Project Structure

```
SmartRail/
├── main.py                 # FastAPI app, middleware, WebSockets
├── celery_worker.py        # Celery tasks (delay alerts)
├── requirements.txt
├── .env
├── models/
│   └── delay_model.pkl     # Trained XGBoost model
├── scripts/
│   └── train_delay_model.py
└── app/
    ├── api/                # Route handlers
    ├── core/               # Config, DB, JWT, Celery, middleware
    ├── models/             # SQLAlchemy ORM models
    ├── schemas/            # Pydantic request/response models
    ├── services/           # Business logic
    └── ml/                 # Delay prediction
```

---

## API Overview

All `/api/*` routes require a JWT **except** `POST /api/auth/register`, `POST /api/auth/login`, and `GET /api/v1/health`.

| Prefix            | Description                                      |
|-------------------|--------------------------------------------------|
| `/api/auth`       | Register, login, current user                    |
| `/api/trains`     | Trains, delay prediction, status updates         |
| `/api/tickets`    | Smart ticket reallocation                        |
| `/api/chat`       | AI chatbot (keyword intent routing)              |
| `/api/analytics`  | Summary, delay trends, zone & platform stats     |
| `/api/v1`         | Health check, legacy ML endpoint                 |
| `/ws/train/{id}`  | Live train status (WebSocket, 10s interval)      |
| `/ws/dashboard`   | Fleet stats (WebSocket, 10s interval)            |

### Authentication

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@example.com","password":"securepass123","role":"admin"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"securepass123"}'

# Use token
curl http://localhost:8000/api/trains/ \
  -H "Authorization: Bearer <access_token>"
```

---

## Architecture Notes

### Routers (`main.py`)

Routers are registered in `register_routers()`:

- `/api/auth` — authentication  
- `/api/trains` — train operations  
- `/api/tickets` — ticket reallocation  
- `/api/chat` — chatbot  
- `/api/analytics` — dashboards  
- `/api/v1` — health & ML  

### JWT middleware

`JWTAuthMiddleware` protects every `/api/*` request. Public routes are defined in `app/core/middleware/route_policy.py`. Admin-only routes (e.g. `PUT /api/trains/{id}/status`) enforce `role=admin`.

Route handlers also use `Depends(get_current_user)` / `Depends(get_db)` for per-request user resolution and PostgreSQL sessions.

### CORS

`CORSMiddleware` allows the React dev server origins from `CORS_ORIGINS` in `.env`.

### Celery + Redis

| Redis DB | Variable                 | Use              |
|----------|--------------------------|------------------|
| 0        | `REDIS_URL`              | App cache / ping |
| 1        | `CELERY_BROKER_URL`      | Task queue       |
| 2        | `CELERY_RESULT_BACKEND`  | Task results     |

`send_delay_alert` is queued automatically when `POST /api/trains/predict-delay` returns a delay greater than 60 minutes.

---

## Environment Variables Reference

| Variable                      | Description                        |
|-------------------------------|------------------------------------|
| `DATABASE_URL`                | PostgreSQL connection string       |
| `REDIS_URL`                   | Redis for app                      |
| `CELERY_BROKER_URL`           | Celery message broker              |
| `CELERY_RESULT_BACKEND`       | Celery result store                |
| `SECRET_KEY`                  | JWT signing key                    |
| `CORS_ORIGINS`                | JSON list of allowed frontend URLs |
| `DELAY_ALERT_THRESHOLD_MINUTES` | Delay alert trigger (default 60) |
| `TWILIO_SID` / `SENDGRID_KEY` | Notification API keys              |

---

## Development

```bash
# Health check (no auth)
curl http://localhost:8000/api/v1/health

# Re-train ML model
python scripts/train_delay_model.py

# Run API with auto-reload
uvicorn main:app --reload --port 8000
```

---

## License

Private / internal use.
