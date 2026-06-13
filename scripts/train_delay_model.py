"""Train and persist the XGBoost delay prediction model."""

from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBRegressor

FEATURE_COLUMNS = [
    "train_number",
    "route",
    "day_of_week",
    "weather_condition",
    "season",
]

TRAIN_NUMBERS = [f"12{i:03d}" for i in range(1, 11)]
ROUTES = ["delhi-mumbai", "chennai-bangalore", "kolkata-patna", "hyderabad-pune"]
DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
WEATHER = ["clear", "rain", "fog", "storm", "heatwave"]
SEASONS = ["winter", "summer", "monsoon", "autumn"]

RNG = np.random.default_rng(42)


def build_dataset(rows: int = 500) -> pd.DataFrame:
    data = {
        "train_number": RNG.choice(TRAIN_NUMBERS, rows),
        "route": RNG.choice(ROUTES, rows),
        "day_of_week": RNG.choice(DAYS, rows),
        "weather_condition": RNG.choice(WEATHER, rows),
        "season": RNG.choice(SEASONS, rows),
    }
    frame = pd.DataFrame(data)
    frame["delay_minutes"] = (
        frame["weather_condition"].map(
            {"clear": 5, "rain": 25, "fog": 18, "storm": 35, "heatwave": 12}
        )
        + frame["season"].map({"winter": 4, "summer": 8, "monsoon": 20, "autumn": 10})
        + frame["day_of_week"].map(
            {day: index for index, day in enumerate(DAYS)}
        )
        + RNG.normal(0, 3, rows)
    ).clip(0)
    return frame


def train_and_save(output_path: Path) -> None:
    dataset = build_dataset()
    label_encoders: dict[str, LabelEncoder] = {}

    encoded = dataset.copy()
    for column in FEATURE_COLUMNS:
        encoder = LabelEncoder()
        encoded[column] = encoder.fit_transform(dataset[column].astype(str))
        label_encoders[column] = encoder

    model = XGBRegressor(
        n_estimators=120,
        max_depth=4,
        learning_rate=0.1,
        random_state=42,
    )
    model.fit(encoded[FEATURE_COLUMNS], dataset["delay_minutes"])

    output_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(
        {
            "model": model,
            "label_encoders": label_encoders,
            "feature_columns": FEATURE_COLUMNS,
        },
        output_path,
    )
    print(f"Model saved to {output_path}")


if __name__ == "__main__":
    project_root = Path(__file__).resolve().parents[1]
    train_and_save(project_root / "models" / "delay_model.pkl")
