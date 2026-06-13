import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))
from dotenv import load_dotenv
load_dotenv(PROJECT_ROOT / ".env")

from app.ml.delay_model import predict_delay
from app.core.database import get_db
from app.services.train_service import TrainService

def test_predict():
    db = next(get_db())
    train = TrainService.get_train(db, 1)
    if not train:
        print("No train with ID 1 found. DB might not be seeded or empty.")
        # fallback to arbitrary values
        t_num = "12345"
        t_name = "Mock Train"
    else:
        t_num = train.number
        t_name = train.name
        print(f"Found Train ID 1: {t_name} ({t_num})")

    features = {
        "train_number": t_num,
        "train_name": t_name,
        "pct_significant_delay": 0.5,
        "pct_slight_delay": 0.2,
        "pct_cancelled_unknown": 0.05,
        "pct_right_time": 0.25,
        "station_name": "CHENNAI CENTRAL",
        "source_url": "http://example.com",
        "station_code": "MAS",
        "scraped_at_hour": 14
    }
    
    prediction, confidence = predict_delay(features)
    print(f"\n--- TEST RESULTS ---")
    print(f"Features: {features}")
    print(f"Predicted Delay: {prediction} minutes")
    print(f"Confidence: {confidence}")

if __name__ == "__main__":
    test_predict()
