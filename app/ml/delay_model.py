from pathlib import Path
from typing import Any
import pickle
import pandas as pd
import numpy as np

from app.ml.train_model import load_data, clean_and_merge

MODEL_PATH = Path(__file__).resolve().parents[2] / "models" / "delay_model.pkl"
ENCODERS_PATH = Path(__file__).resolve().parents[2] / "models" / "encoders.pkl"

class DelayModel:
    """Random Forest-based train delay predictor."""

    def __init__(self, model_path: Path | None = None, encoders_path: Path | None = None) -> None:
        self.model_path = model_path or MODEL_PATH
        self.encoders_path = encoders_path or ENCODERS_PATH
        self._model = None
        self._encoders = None
        self._features_cache: pd.DataFrame | None = None

    def _load_artifacts(self) -> None:
        if self._model is None:
            if not self.model_path.exists():
                raise FileNotFoundError(f"Trained model not found at {self.model_path}. ")
            with open(self.model_path, 'rb') as f:
                self._model = pickle.load(f)
            
        if self._encoders is None:
            if not self.encoders_path.exists():
                raise FileNotFoundError(f"Encoders not found at {self.encoders_path}. ")
            with open(self.encoders_path, 'rb') as f:
                self._encoders = pickle.load(f)

    def _load_features_cache(self) -> None:
        if self._features_cache is None:
            # Load raw datasets and clean/merge them to extract features
            df_delays, df_cleartrip, df_details, df_info = load_data()
            df_merged = clean_and_merge(df_delays, df_cleartrip, df_details, df_info)
            # We don't need the target variable or everything, but we can just cache df_merged.
            # To save memory, we could drop duplicates based on train_number and station_code
            self._features_cache = df_merged.drop_duplicates(subset=['train_number', 'station_code'])

    def predict_delay(self, input_features: dict) -> tuple[float, float]:
        """
        Predict delay in minutes and confidence.
        input_features should contain 'train_number' and 'station_code'.
        """
        self._load_artifacts()
        self._load_features_cache()
        
        train_number = str(input_features.get('train_number')).zfill(5)
        station_code = str(input_features.get('station_code'))
        
        # Look up the row in the cache
        row = self._features_cache[
            (self._features_cache['train_number'] == train_number) & 
            (self._features_cache['station_code'] == station_code)
        ]
        
        if row.empty:
            train_row = self._features_cache[
                self._features_cache['train_number'] == train_number
            ]
            if train_row.empty:
                raise ValueError(f"No feature data found for train {train_number}")
            
            # Use the first row for this train, but update the station code
            row = train_row.iloc[0].copy()
            row['station_code'] = station_code
        else:
            row = row.iloc[0].copy()
        
        # Build the final dataframe with exact feature order used in training
        expected_features = ['station_code', 'pct_right_time', 'pct_slight_delay', 'pct_significant_delay', 
                             'pct_cancelled_unknown', 'Starts', 'Ends', 'Distance', 'running_days_count']
                             
        df = pd.DataFrame([row])
        df = df[expected_features]
        
        # Apply encoders
        cat_cols = ['station_code', 'Starts', 'Ends']
        for col in cat_cols:
            if col in self._encoders:
                le = self._encoders[col]
                # convert to string
                df[col] = df[col].astype(str)
                # Handle unknown labels
                df[col] = df[col].apply(lambda x: le.transform([x])[0] if x in le.classes_ else 0)
                
        prediction = float(self._model.predict(df)[0])
        
        # Dummy confidence for now
        confidence = 0.85
        
        return round(max(0.0, prediction), 2), confidence

_delay_model: DelayModel | None = None

def get_delay_model() -> DelayModel:
    global _delay_model
    if _delay_model is None:
        _delay_model = DelayModel()
    return _delay_model

def predict_delay(features: dict) -> tuple[float, float]:
    return get_delay_model().predict_delay(features)
