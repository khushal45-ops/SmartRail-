import pandas as pd
import numpy as np
import json
import os
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

def load_data():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    dataset_dir = os.path.join(base_dir, 'Dataset')
    
    # 1. Primary dataset
    df_delays = pd.read_csv(os.path.join(dataset_dir, 'etrain_delays.csv'))
    
    # 2. trains_cleartrip.csv
    df_cleartrip = pd.read_csv(os.path.join(dataset_dir, 'trains_cleartrip.csv'))
    
    # 3. Train_details
    df_details = pd.read_csv(os.path.join(dataset_dir, 'Train_details_22122017.csv'), low_memory=False)
    
    # 4. traininfo.json
    with open(os.path.join(dataset_dir, 'traininfo.json'), 'r') as f:
        traininfo = json.load(f)
    df_info = pd.DataFrame(traininfo)
    
    return df_delays, df_cleartrip, df_details, df_info

def clean_and_merge(df_delays, df_cleartrip, df_details, df_info):
    # Ensure train_number is string across all datasets to merge properly
    df_delays['train_number'] = df_delays['train_number'].astype(str).str.zfill(5)
    
    # trains_cleartrip
    df_cleartrip.rename(columns={'Train no.': 'train_number'}, inplace=True)
    df_cleartrip['train_number'] = df_cleartrip['train_number'].astype(str).str.zfill(5)
    
    # Train details
    df_details.rename(columns={'Train No': 'train_number', 'Station Code': 'station_code'}, inplace=True)
    df_details['train_number'] = df_details['train_number'].astype(str).str.zfill(5)
    
    # info
    df_info.rename(columns={'trainNumber': 'train_number'}, inplace=True)
    df_info['train_number'] = df_info['train_number'].astype(str).str.zfill(5)
    
    # Engineer running_days_count
    days = ['trainRunsOnMon', 'trainRunsOnTue', 'trainRunsOnWed', 'trainRunsOnThu', 'trainRunsOnFri', 'trainRunsOnSat', 'trainRunsOnSun']
    for day in days:
        if day in df_info.columns:
            df_info[day] = (df_info[day] == 'Y').astype(int)
        else:
            df_info[day] = 0
            
    df_info['running_days_count'] = df_info[days].sum(axis=1)
    
    # Select subset from primary
    df_primary = df_delays[['train_number', 'station_code', 'average_delay_minutes', 
                            'pct_right_time', 'pct_slight_delay', 'pct_significant_delay', 
                            'pct_cancelled_unknown']].copy()
                            
    # Drop rows with NaN in target
    df_primary.dropna(subset=['average_delay_minutes'], inplace=True)
    
    # Fill remaining NaNs in percentages with 0
    cols_to_fill = ['pct_right_time', 'pct_slight_delay', 'pct_significant_delay', 'pct_cancelled_unknown']
    df_primary[cols_to_fill] = df_primary[cols_to_fill].fillna(0)
    
    # Merge with cleartrip to get Starts and Ends
    df_merged = pd.merge(df_primary, df_cleartrip[['train_number', 'Starts', 'Ends']].drop_duplicates(subset=['train_number']), 
                         on='train_number', how='left')
                         
    # Extract route distance from df_details by taking max distance per train and station
    # Force 'Distance' column to numeric, ignoring non-numeric values
    df_details['Distance'] = pd.to_numeric(df_details['Distance'], errors='coerce')
    df_dist = df_details[['train_number', 'station_code', 'Distance']].drop_duplicates(subset=['train_number', 'station_code'])
    df_dist = df_dist.groupby(['train_number', 'station_code'], as_index=False).max()
    
    df_merged = pd.merge(df_merged, df_dist, on=['train_number', 'station_code'], how='left')
    
    # Merge with df_info
    df_merged = pd.merge(df_merged, df_info[['train_number', 'running_days_count']].drop_duplicates(subset=['train_number']), 
                         on='train_number', how='left')
                         
    # Fill missing values created by left joins
    df_merged['Starts'] = df_merged['Starts'].fillna('Unknown')
    df_merged['Ends'] = df_merged['Ends'].fillna('Unknown')
    df_merged['Distance'] = df_merged['Distance'].fillna(0)
    df_merged['running_days_count'] = df_merged['running_days_count'].fillna(0)
    df_merged['station_code'] = df_merged['station_code'].fillna('Unknown')
    
    return df_merged

def train_and_evaluate(df):
    encoders = {}
    cat_cols = ['station_code', 'Starts', 'Ends']
    
    df_encoded = df.copy()
    for col in cat_cols:
        le = LabelEncoder()
        # convert to string just in case
        df_encoded[col] = df_encoded[col].astype(str)
        df_encoded[col] = le.fit_transform(df_encoded[col])
        encoders[col] = le
        
    # Features and target
    features = ['station_code', 'pct_right_time', 'pct_slight_delay', 'pct_significant_delay', 
                'pct_cancelled_unknown', 'Starts', 'Ends', 'Distance', 'running_days_count']
    X = df_encoded[features]
    y = df_encoded['average_delay_minutes']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest...")
    rf_model = RandomForestRegressor(n_estimators=50, random_state=42, n_jobs=-1)
    rf_model.fit(X_train, y_train)
    rf_preds = rf_model.predict(X_test)
    
    print("Random Forest Evaluation:")
    print(f"MAE: {mean_absolute_error(y_test, rf_preds):.4f}")
    print(f"RMSE: {np.sqrt(mean_squared_error(y_test, rf_preds)):.4f}")
    print(f"R2: {r2_score(y_test, rf_preds):.4f}")
    
    print("\nTraining XGBoost...")
    xgb_model = XGBRegressor(n_estimators=50, random_state=42, n_jobs=-1)
    xgb_model.fit(X_train, y_train)
    xgb_preds = xgb_model.predict(X_test)
    
    print("XGBoost Evaluation:")
    print(f"MAE: {mean_absolute_error(y_test, xgb_preds):.4f}")
    print(f"RMSE: {np.sqrt(mean_squared_error(y_test, xgb_preds)):.4f}")
    print(f"R2: {r2_score(y_test, xgb_preds):.4f}")
    
    # Choose best model (by RMSE)
    rf_rmse = np.sqrt(mean_squared_error(y_test, rf_preds))
    xgb_rmse = np.sqrt(mean_squared_error(y_test, xgb_preds))
    
    best_model = rf_model if rf_rmse < xgb_rmse else xgb_model
    best_name = "Random Forest" if rf_rmse < xgb_rmse else "XGBoost"
    
    print(f"\nBest Model selected: {best_name}")
    
    return best_model, encoders

def main():
    print("Loading data...")
    df_delays, df_cleartrip, df_details, df_info = load_data()
    
    print("Cleaning and merging data...")
    df_merged = clean_and_merge(df_delays, df_cleartrip, df_details, df_info)
    
    print("Training models...")
    best_model, encoders = train_and_evaluate(df_merged)
    
    print("Saving best model and encoders...")
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    models_dir = os.path.join(base_dir, 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    with open(os.path.join(models_dir, 'delay_model.pkl'), 'wb') as f:
        pickle.dump(best_model, f)
        
    with open(os.path.join(models_dir, 'encoders.pkl'), 'wb') as f:
        pickle.dump(encoders, f)
        
    print("Done!")

if __name__ == '__main__':
    main()
