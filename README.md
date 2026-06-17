# SmartRail — AI-Powered Railway Management System

Minor Project - II | Acropolis Institute of Technology and Research, Indore
Department of Information Technology & CSE (Data Science) | B.Tech Third Year | Jan – June 2026

---

## Team

| Name | Role |
|------|------|
| Khushal | ML Model, Backend API |
| Darshan | Frontend Components |
| Divyansh | Database, Authentication |
| Aaryan | Testing, Documentation |

Guide: Prof. Mayank Bhat

---

## About the Project

SmartRail is an AI-powered Railway Management System that predicts train delays, reallocates tickets intelligently, provides real-time train tracking, and assists passengers through an AI chatbot.

Traditional railway systems only show current train status — they do not predict future delays or suggest alternatives. SmartRail solves this with ML.

---

## Features

| Feature | Description |
|---------|-------------|
| Delay Prediction | Random Forest model (93.21% R2) predicts delay in minutes |
| Smart Ticket Reallocation | Auto-suggests alternative trains when delay exceeds 60 min |
| Real-time Tracking | WebSocket live train status updates every 10 seconds |
| Analytics Dashboard | Zone performance, delay trends, platform utilization |
| AI Chatbot | Intent-based chatbot for PNR, delay, cancellation queries |
| Role-Based Access | Separate Passenger and Admin portals |
| Alert System | Celery + Redis async SMS/Email delay notifications |

---

## ML Model Details

| Property | Value |
|----------|-------|
| Algorithm | Random Forest Regressor |
| R2 Score | 0.9321 (93.21%) |
| RMSE | 14.58 minutes |
| Training Data | etrain_delays.csv + 4 supporting datasets |
| Features Used | 9 (station_code, pct_right_time, distance, running_days, etc.) |
| Saved Model | models/delay_model.pkl |
| Encoders | models/encoders.pkl |

---

## Tech Stack

Frontend:
- React.js + TypeScript (Vite)
- Tailwind CSS + shadcn/ui
- Axios, WebSocket

Backend:
- FastAPI (Python 3.11+)
- SQLAlchemy ORM
- PostgreSQL 14+
- Redis 6+
- Celery (background tasks)

Machine Learning:
- Scikit-learn (Random Forest, Gradient Boosting)
- XGBoost
- Pandas, NumPy
- Joblib (model serialization)

---

## Project Structure

SmartRail/
├── app/
│   ├── api/          - FastAPI route handlers
│   ├── ml/           - Machine Learning pipeline
│   ├── models/       - SQLAlchemy DB models
│   ├── schemas/      - Pydantic schemas
│   ├── services/     - Business logic
│   └── core/         - Config, JWT, DB
├── src/              - React frontend
├── Dataset/          - Training datasets
├── models/           - Saved ML models
├── scripts/          - Utility scripts
├── main.py
├── celery_worker.py
├── requirements.txt
└── package.json

---

## Dataset Info

| File | Size | Used For |
|------|------|----------|
| etrain_delays.csv | 300 KB | Primary ML training data |
| Train_details_22122017.csv | 16.7 MB | Station sequence, distance |
| traininfo.json | 16.8 MB | Train schedule, running days |
| trains_cleartrip.csv | 193 KB | Route info |
| price_data.csv | 124.8 MB | Ticket pricing (excluded from repo) |

Note: price_data.csv is excluded due to GitHub 100MB limit. Place it manually in Dataset/ folder.

---

## How to Run

### Backend

```
git clone https://github.com/khushal45-ops/SmartRail-.git
cd SmartRail-
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python app/ml/train_model.py
python -m uvicorn main:app --reload --port 8000
```

Backend runs at:https://smartrail-uwmt.onrender.com
Swagger Docs: https://smartrail-uwmt.onrender.com

### Frontend

```
npm install
npm run dev
```

Frontend runs at:https://smartrail-57z0.onrender.com


---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Passenger | passenger@smartrail.com | pass123 |
| Admin | admin@smartrail.com | admin123 |

---

## API Endpoints

| Prefix | Description |
|--------|-------------|
| /api/auth | Register, Login |
| /api/trains | Train list, Delay Prediction |
| /api/tickets | Ticket Reallocation |
| /api/chat | AI Chatbot |
| /api/analytics | Dashboard stats |
| /ws/train/{id} | Live train status WebSocket |
| /ws/dashboard | Fleet stats WebSocket |

---

## Future Scope

- Integration with official IRCTC API
- GPS-based real-time train location
- Mobile application (React Native)
- Voice assistant support
- Nationwide deployment

---

## License

Academic use only — Minor Project II, Acropolis Institute of Technology and Research, Indore.

Made with love by Team SmartRail | Acropolis Institute, Indore | 2026
