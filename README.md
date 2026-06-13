# SmartRail - AI Powered Railway Management

AI-powered railway operations application. Includes delay prediction (XGBoost), smart ticket reallocation, real-time WebSockets, analytics, and a keyword-based chatbot.

---

## Features

- **Delay Prediction**: AI-powered delay prediction using XGBoost.
- **Smart Ticket Reallocation**: Intelligent reallocation of tickets.
- **Real-time Updates**: Live WebSockets for train status and dashboard stats.
- **Analytics Dashboard**: Summary of operations, delay trends, and platform statistics.
- **AI Chatbot**: Keyword-based intent routing chatbot for user queries.

---

## Tech Stack Used

**Frontend**:
- React (built with Vite)
- Node.js (18+)

**Backend**:
- FastAPI (Python 3.11+)
- PostgreSQL (14+) for primary database
- SQLAlchemy as ORM
- Redis (6+) for caching and message brokering
- Celery for background tasks
- XGBoost for machine learning models

---

## Dataset Info

The `Dataset/` directory contains various CSV and JSON files used for model training and analysis:
- `Train_details_22122017.csv` (16.7 MB) - Comprehensive train details.
- `etrain_delays.csv` (300 KB) - Historical delay data.
- `price_data.csv` (124.8 MB) - Ticket pricing data.
- `traininfo.json` (16.8 MB) - Information about trains in JSON format.
- `trains_cleartrip.csv` (193 KB) - Cleartrip train data.

---

## How to Run Backend

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
```

### 4. Setup Services

Create the PostgreSQL database (`railway_db`) and start Redis (e.g. `docker run -d --name redis -p 6379:6379 redis:7`).

### 5. Train the delay prediction model

```bash
python scripts/train_delay_model.py
```

### 6. Run the API and Celery worker

**Terminal 1 (FastAPI):**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
- API: http://localhost:8000  
- Swagger docs: http://localhost:8000/docs  

**Terminal 2 (Celery):**
```bash
celery -A celery_worker.celery_app worker --loglevel=info
```

---

## How to Run Frontend

Open a new terminal and navigate to the project directory:

```bash
# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```

Frontend will be available at: http://localhost:5173

---

## API Overview

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

---

## License

Private / internal use.
