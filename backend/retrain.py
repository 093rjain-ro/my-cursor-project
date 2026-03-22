"""
backend/retrain.py
Weekly model retraining pipeline.
Pulls fresh data from Supabase, retrains CatBoost,
and replaces Model.pkl only if the new model is better.
"""

import os
import pickle
import logging
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from catboost import CatBoostRegressor

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)s  %(message)s")
log = logging.getLogger("retrain")

MODEL_PATH        = os.path.join("Artifacts", "Model.pkl")
PREPROCESSOR_PATH = os.path.join("Artifacts", "Preprocessor.pkl")
BACKUP_SUFFIX     = datetime.now().strftime("%Y%m%d_%H%M%S")

CATEGORICAL_COLS = ["gender", "race_ethnicity", "parental_level_of_education", "lunch", "test_preparation_course"]
NUMERICAL_COLS   = ["reading_score", "writing_score"]
TARGET           = "math_score"


def fetch_data():
    supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))
    try:
        result = supabase.table("student_submissions").select(
            "gender, race_ethnicity, parental_level_of_education, "
            "lunch, test_preparation_course, reading_score, writing_score, actual_math_score"
        ).neq("actual_math_score", "null").execute()
        rows = result.data
        log.info(f"Fetched {len(rows)} labelled rows.")
    except Exception as e:
        log.warning(f"Could not fetch data from Supabase: {e}")
        rows = []

    if len(rows) < 50:
        log.warning("Not enough data (<50 rows). Falling back to local stud.csv.")
        fallback_path = os.path.join("Notebook_Experiments", "Data", "stud.csv")
        return pd.read_csv(fallback_path)

    df = pd.DataFrame(rows).rename(columns={"actual_math_score": TARGET})
    return df


def build_preprocessor():
    return ColumnTransformer([
        ("num", Pipeline([("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())]), NUMERICAL_COLS),
        ("cat", Pipeline([("imputer", SimpleImputer(strategy="most_frequent")), ("ohe", OneHotEncoder(handle_unknown="ignore")), ("scaler", StandardScaler(with_mean=False))]), CATEGORICAL_COLS),
    ])


def train(df):
    X = df.drop(columns=[TARGET])
    y = df[TARGET]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    preprocessor = build_preprocessor()
    X_train_t = preprocessor.fit_transform(X_train)
    X_test_t  = preprocessor.transform(X_test)
    model = CatBoostRegressor(iterations=200, learning_rate=0.05, depth=8, verbose=False, random_seed=42)
    model.fit(X_train_t, y_train)
    preds = model.predict(X_test_t)
    r2  = r2_score(y_test, preds)
    mae = mean_absolute_error(y_test, preds)
    log.info(f"New model → R²: {r2:.4f} | MAE: {mae:.2f}")
    return model, preprocessor, r2, mae


def current_r2(df):
    try:
        with open(MODEL_PATH, "rb") as f: model = pickle.load(f)
        with open(PREPROCESSOR_PATH, "rb") as f: prep = pickle.load(f)
        X = df.drop(columns=[TARGET]); y = df[TARGET]
        _, X_test, _, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        r2 = r2_score(y_test, model.predict(prep.transform(X_test)))
        log.info(f"Current model → R²: {r2:.4f}")
        return r2
    except Exception as e:
        log.warning(f"Could not evaluate current model: {e}")
        return 0.0


def save(model, preprocessor, r2, mae):
    os.makedirs("Artifacts", exist_ok=True)
    if os.path.exists(MODEL_PATH):
        os.rename(MODEL_PATH, MODEL_PATH.replace(".pkl", f"_backup_{BACKUP_SUFFIX}.pkl"))
    with open(MODEL_PATH, "wb") as f: pickle.dump(model, f)
    with open(PREPROCESSOR_PATH, "wb") as f: pickle.dump(preprocessor, f)
    with open("Artifacts/retrain_log.txt", "a") as f:
        f.write(f"{datetime.now().isoformat()}  R²={r2:.4f}  MAE={mae:.2f}\n")
    log.info(f"✅ New model saved → R²: {r2:.4f} | MAE: {mae:.2f}")


def main():
    log.info("=" * 50)
    log.info("EduSense weekly retrain pipeline starting...")
    df = fetch_data()
    old_r2 = current_r2(df)
    new_model, new_prep, new_r2, new_mae = train(df)
    if new_r2 > old_r2:
        log.info(f"Deploying new model ({new_r2:.4f} > {old_r2:.4f})")
        save(new_model, new_prep, new_r2, new_mae)
    else:
        log.info(f"Keeping current model ({new_r2:.4f} ≤ {old_r2:.4f})")
    log.info("Done.")


if __name__ == "__main__":
    main()
