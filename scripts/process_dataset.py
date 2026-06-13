import os
import sys
import traceback
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from dotenv import load_dotenv
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))
load_dotenv(PROJECT_ROOT / ".env")

from app.models.train import Train
from app.models.delay_log import DelayLog

DATASET_DIR = PROJECT_ROOT / "Dataset"
MODELS_DIR = PROJECT_ROOT / "models"
MODELS_DIR.mkdir(exist_ok=True)

def step1_scan_dataset():
    print("--- STEP 1: SCAN DATASET FOLDER ---")
    useful_files = []
    
    if not DATASET_DIR.exists():
        print(f"Error: Directory {DATASET_DIR} does not exist.")
        return []
        
    for file in os.listdir(DATASET_DIR):
        if file.endswith('.csv'):
            file_path = DATASET_DIR / file
            try:
                # Read just top rows to scan schema
                df = pd.read_csv(file_path, nrows=10)
                print(f"\nFile: {file}")
                print(f"Columns: {list(df.columns)}")
                
                # We can't get true shape without full read, so do a quick full read or just skip shape
                full_df = pd.read_csv(file_path)
                print(f"Shape: {full_df.shape}")
                print(f"Sample 3 rows:\n{full_df.head(3)}")
                
                # Check usefulness
                cols_lower = [c.lower() for c in df.columns]
                delay_related = any(k in c for c in cols_lower for k in ['delay', 'late', 'diff', 'duration', 'arrival'])
                train_related = any(k in c for c in cols_lower for k in ['train', 'number', 'route', 'station'])
                
                if delay_related or train_related:
                    useful_files.append(file_path)
                    
            except Exception as e:
                print(f"Error reading {file}: {e}")

    print(f"\nUseful files identified: {[f.name for f in useful_files]}")
    return useful_files

def step2_smart_merge(useful_files):
    print("\n--- STEP 2: SMART MERGE ---")
    dataframes = {}
    for file_path in useful_files:
        try:
            df = pd.read_csv(file_path)
            dataframes[file_path.name] = df
            print(f"Loaded {file_path.name}: {df.shape}")
        except Exception as e:
            print(f"Error loading {file_path.name}: {e}")
            
    if not dataframes:
        print("No dataframes to merge.")
        return None

    df_list = list(dataframes.values())
    if len(df_list) == 1:
        merged_df = df_list[0]
        print(f"Only one file loaded. Final merged dataframe shape: {merged_df.shape}")
        return merged_df
        
    merged_df = df_list[0]
    for i in range(1, len(df_list)):
        df_next = df_list[i]
        common_cols = list(set(merged_df.columns).intersection(set(df_next.columns)))
        if common_cols:
            print(f"Merging with next dataframe on {common_cols}")
            try:
                merged_df = pd.merge(merged_df, df_next, on=common_cols, how='inner', suffixes=('', '_dup'))
                merged_df = merged_df.loc[:, ~merged_df.columns.str.endswith('_dup')] # Drop duplicate columns
            except Exception as e:
                print(f"Merge failed: {e}")
        else:
            print("No common columns for merge, skipping.")
            
    print(f"Final merged dataframe shape: {merged_df.shape}")
    print(f"Final merged columns: {list(merged_df.columns)}")
    return merged_df

def step3_clean_data(df):
    print("\n--- STEP 3: CLEAN DATA ---")
    if df is None: return None
    original_shape = df.shape
    
    # Drop >40% missing
    thresh = len(df) * 0.6
    df = df.dropna(thresh=thresh, axis=1).copy()
    
    # Fill remaining missing
    for col in df.columns:
        if pd.api.types.is_numeric_dtype(df[col]):
            df[col] = df[col].fillna(df[col].median())
        else:
            mode_val = df[col].mode()
            if not mode_val.empty:
                df[col] = df[col].fillna(mode_val[0])
                
    # Remove duplicates
    df = df.drop_duplicates()
    
    # Fix datatypes (dates and numbers)
    for col in df.columns:
        if df[col].dtype == object:
            # Check if looks like date
            sample_val = str(df[col].iloc[0]) if len(df) > 0 else ""
            if any(k in sample_val for k in ['-', '/', ':']) and any(c.isdigit() for c in sample_val):
                try:
                    df[col] = pd.to_datetime(df[col], errors='ignore')
                except Exception:
                    pass
    
    print(f"Before shape: {original_shape}")
    print(f"After shape: {df.shape}")
    return df

def step4_feature_engineering(df):
    print("\n--- STEP 4: FEATURE ENGINEERING ---")
    encoders = {}
    scaler = StandardScaler()
    
    datetime_cols = df.select_dtypes(include=['datetime64', 'datetimetz']).columns
    for col in datetime_cols:
        df[f"{col}_hour"] = df[col].dt.hour
        df[f"{col}_day_of_week"] = df[col].dt.dayofweek
        df[f"{col}_month"] = df[col].dt.month
        df[f"{col}_is_weekend"] = (df[col].dt.dayofweek >= 5).astype(int)
        df[f"{col}_is_holiday"] = 0 
        df = df.drop(columns=[col])

    bool_cols = df.select_dtypes(include=['bool']).columns
    for col in bool_cols:
        df[col] = df[col].astype(int)
        
    categorical_cols = df.select_dtypes(include=['object']).columns
    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = df[col].astype(str)
        df[col] = le.fit_transform(df[col])
        encoders[col] = le
        
    numeric_cols = df.select_dtypes(include=['int32', 'int64', 'float32', 'float64']).columns
    
    print("Features extracted successfully.")
    return df, encoders, scaler, list(numeric_cols)

def step5_identify_target(df):
    print("\n--- STEP 5: IDENTIFY TARGET COLUMN ---")
    target_col = None
    target_candidates = ['delay', 'late', 'diff', 'duration']
    for col in df.columns:
        if any(c in col.lower() for c in target_candidates):
            target_col = col
            break
            
    if not target_col:
        print("No direct delay column found.")
        if len(df.columns) > 0:
            target_col = df.columns[-1]
            
    if target_col:
        print(f"Target column identified: {target_col}")
        print(f"Distribution:\n{df[target_col].describe()}")
        
    return target_col

def step6_train_model(df, target_col, encoders, scaler, numeric_cols):
    print("\n--- STEP 6: TRAIN MODEL ---")
    if target_col not in df.columns:
        print("Target column missing. Aborting training.")
        return None, None
        
    X = df.drop(columns=[target_col])
    y = df[target_col]
    
    # Scale numeric features (exclude target)
    X_num_cols = [c for c in numeric_cols if c in X.columns]
    if X_num_cols:
        X[X_num_cols] = scaler.fit_transform(X[X_num_cols])
    
    # Save encoders and scaler
    artifact = {
        "label_encoders": encoders,
        "scaler": scaler,
        "scaled_columns": X_num_cols,
        "features": list(X.columns)
    }
    joblib.dump(artifact, MODELS_DIR / "encoders.pkl")
    print(f"Saved encoders and scaler to {MODELS_DIR / 'encoders.pkl'}")
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    models = {
        "XGBoost": XGBRegressor(random_state=42),
        "Random Forest": RandomForestRegressor(random_state=42, n_estimators=20),
        "Gradient Boosting": GradientBoostingRegressor(random_state=42, n_estimators=50)
    }
    
    best_model = None
    best_score = -float('inf')
    best_name = ""
    
    for name, model in models.items():
        try:
            model.fit(X_train, y_train)
            preds = model.predict(X_test)
            mae = mean_absolute_error(y_test, preds)
            rmse = np.sqrt(mean_squared_error(y_test, preds))
            r2 = r2_score(y_test, preds)
            
            print(f"{name} -> MAE: {mae:.2f}, RMSE: {rmse:.2f}, R2: {r2:.2f}")
            
            if r2 > best_score:
                best_score = r2
                best_model = model
                best_name = name
        except Exception as e:
            print(f"Error training {name}: {e}")
            
    if best_model:
        print(f"\nBest model is {best_name} with R2: {best_score:.2f}")
        joblib_dict = {"model": best_model, "features": list(X.columns)}
        joblib.dump(joblib_dict, MODELS_DIR / "delay_model.pkl")
        print(f"Saved best model to {MODELS_DIR / 'delay_model.pkl'}")
        
        if hasattr(best_model, 'feature_importances_'):
            importances = best_model.feature_importances_
            indices = np.argsort(importances)[::-1]
            print("\nTop 10 important features:")
            top_features = []
            for i in range(min(10, len(indices))):
                feat = X.columns[indices[i]]
                top_features.append(feat)
                print(f"{i+1}. {feat} ({importances[indices[i]]:.4f})")
                
    return best_model, list(X.columns)

def step8_seed_database(df, original_df):
    print("\n--- STEP 8: SEED DATABASE ---")
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not found in .env")
        return
        
    print(f"Connecting to DB...")
    try:
        engine = create_engine(db_url)
        # Ensure tables exist
        from app.core.database import Base
        Base.metadata.create_all(engine)
        
        Session = sessionmaker(bind=engine)
        session = Session()
        
        train_cols = [c for c in original_df.columns if 'train' in c.lower() or 'number' in c.lower() or 'no' in c.lower()]
        name_cols = [c for c in original_df.columns if 'name' in c.lower()]
        
        train_num_col = train_cols[0] if train_cols else original_df.columns[0]
        train_name_col = name_cols[0] if name_cols else "Unknown"
        
        inserted_trains = 0
        inserted_logs = 0
        
        unique_trains = original_df.drop_duplicates(subset=[train_num_col]).dropna(subset=[train_num_col])
        
        target_col = step5_identify_target(original_df)
        
        for _, row in unique_trains.iterrows():
            t_num = str(row[train_num_col])
            t_name = str(row[train_name_col]) if train_name_col in original_df.columns else f"Train {t_num}"
            
            existing = session.execute(select(Train).where(Train.number == t_num)).scalars().first()
            if not existing:
                new_train = Train(
                    name=t_name,
                    number=t_num,
                    route=str(row.get('route', 'Unknown')),
                    platform=str(row.get('platform', '1')),
                    zone=str(row.get('zone', 'Unknown')),
                    status='active'
                )
                session.add(new_train)
                session.commit()
                existing = new_train
                inserted_trains += 1
                
            if target_col:
                delay_val = row.get(target_col, 0)
                if pd.isna(delay_val): delay_val = 0
                log = DelayLog(
                    train_id=existing.id,
                    predicted_delay=float(delay_val),
                    actual_delay=float(delay_val)
                )
                session.add(log)
                inserted_logs += 1
                
        session.commit()
        print(f"Inserted {inserted_trains} unique trains.")
        print(f"Inserted {inserted_logs} delay logs.")
        
    except Exception as e:
        print(f"Database error: {e}")
        traceback.print_exc()

def main():
    try:
        useful_files = step1_scan_dataset()
        merged_df = step2_smart_merge(useful_files)
        
        if merged_df is not None:
            original_df = merged_df.copy()
            cleaned_df = step3_clean_data(merged_df)
            featured_df, encoders, scaler, numeric_cols = step4_feature_engineering(cleaned_df)
            target_col = step5_identify_target(featured_df)
            model, features = step6_train_model(featured_df, target_col, encoders, scaler, numeric_cols)
            
            step8_seed_database(featured_df, original_df)
            
    except Exception as e:
        print(f"Pipeline failed: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    main()
