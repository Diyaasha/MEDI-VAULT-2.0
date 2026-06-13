import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.multioutput import MultiOutputClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier


BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
MODEL_BUNDLE_PATH = MODELS_DIR / "health_intelligence_bundle.joblib"
FEATURES_PATH = MODELS_DIR / "feature_columns.json"

SYMPTOM_COLUMNS = [
    "fever",
    "cough",
    "fatigue",
    "headache",
    "shortness_of_breath",
    "nausea",
]
VITAL_COLUMNS = [
    "heart_rate_resting",
    "sleep_hours",
    "activity_minutes",
    "wearable_source",
]
ADHERENCE_COLUMNS = [
    "medications_count",
    "missed_doses_last_week",
    "late_doses_last_week",
    "reminders_enabled",
    "caregiver_support",
]
TARGET_COLUMNS = ["risk_diabetes", "risk_heart_disease", "risk_stress"]


def generate_synthetic_dataset(size: int = 4500) -> pd.DataFrame:
    rng = np.random.default_rng(42)
    frame = pd.DataFrame(
        {
            "heart_rate_resting": rng.normal(76, 12, size).clip(45, 130),
            "sleep_hours": rng.normal(6.8, 1.4, size).clip(2.5, 10.5),
            "activity_minutes": rng.normal(45, 28, size).clip(0, 220),
            "wearable_source": rng.integers(0, 2, size),
            "medications_count": rng.integers(1, 8, size),
            "missed_doses_last_week": rng.integers(0, 8, size),
            "late_doses_last_week": rng.integers(0, 10, size),
            "reminders_enabled": rng.integers(0, 2, size),
            "caregiver_support": rng.integers(0, 2, size),
            "fever": rng.integers(0, 2, size),
            "cough": rng.integers(0, 2, size),
            "fatigue": rng.integers(0, 2, size),
            "headache": rng.integers(0, 2, size),
            "shortness_of_breath": rng.integers(0, 2, size),
            "nausea": rng.integers(0, 2, size),
        }
    )

    diabetes_score = (
        0.032 * frame["heart_rate_resting"]
        + 0.34 * np.maximum(0, 7 - frame["sleep_hours"])
        + 0.018 * np.maximum(0, 40 - frame["activity_minutes"])
        + 0.85 * frame["fatigue"]
        + 0.45 * frame["nausea"]
    )
    heart_disease_score = (
        0.041 * frame["heart_rate_resting"]
        + 0.31 * np.maximum(0, 6.5 - frame["sleep_hours"])
        + 0.028 * np.maximum(0, 30 - frame["activity_minutes"])
        + 1.0 * frame["shortness_of_breath"]
        + 0.45 * frame["fatigue"]
    )
    stress_score = (
        0.048 * frame["heart_rate_resting"]
        + 0.56 * np.maximum(0, 7 - frame["sleep_hours"])
        + 0.024 * np.maximum(0, 35 - frame["activity_minutes"])
        + 0.6 * frame["headache"]
        + 0.45 * frame["fatigue"]
    )
    adherence_score = (
        1.6 * frame["missed_doses_last_week"]
        + 0.9 * frame["late_doses_last_week"]
        + 0.35 * frame["medications_count"]
        - 1.3 * frame["reminders_enabled"]
        - 0.8 * frame["caregiver_support"]
    )

    frame["risk_diabetes"] = (diabetes_score > 4.6).astype(int)
    frame["risk_heart_disease"] = (heart_disease_score > 5.5).astype(int)
    frame["risk_stress"] = (stress_score > 6.2).astype(int)
    frame["adherence_risk"] = (adherence_score > 5.8).astype(int)
    return frame


def train_models(frame: pd.DataFrame) -> dict:
    disease_pipeline = Pipeline(
        [
            ("scaler", StandardScaler()),
            (
                "classifier",
                MultiOutputClassifier(
                    LogisticRegression(max_iter=400, random_state=42)
                ),
            ),
        ]
    )
    disease_pipeline.fit(frame[VITAL_COLUMNS + SYMPTOM_COLUMNS], frame[TARGET_COLUMNS])

    adherence_model = DecisionTreeClassifier(max_depth=6, random_state=42)
    adherence_model.fit(frame[ADHERENCE_COLUMNS], frame["adherence_risk"])

    return {
        "disease_model": disease_pipeline,
        "adherence_model": adherence_model,
        "symptom_columns": SYMPTOM_COLUMNS,
        "vital_columns": VITAL_COLUMNS,
        "adherence_columns": ADHERENCE_COLUMNS,
        "targets": TARGET_COLUMNS,
    }


def main() -> None:
    dataset = generate_synthetic_dataset()
    bundle = train_models(dataset)

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(bundle, MODEL_BUNDLE_PATH)
    FEATURES_PATH.write_text(
        json.dumps(
            {
                "symptoms": SYMPTOM_COLUMNS,
                "vitals": VITAL_COLUMNS,
                "adherence": ADHERENCE_COLUMNS,
                "targets": TARGET_COLUMNS,
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"Model bundle trained and saved to: {MODEL_BUNDLE_PATH}")


if __name__ == "__main__":
    main()
