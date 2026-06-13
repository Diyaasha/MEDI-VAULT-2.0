import json
from pathlib import Path
from typing import Dict, List, Tuple, Optional

import joblib
import numpy as np
import pandas as pd

from train_model import main as train_models


BASE_DIR = Path(__file__).resolve().parent
MODEL_BUNDLE_PATH = BASE_DIR / "models" / "health_intelligence_bundle.joblib"
TARGETS = ["risk_diabetes", "risk_heart_disease", "risk_stress"]


def _ensure_bundle() -> dict:
    if not MODEL_BUNDLE_PATH.exists():
        train_models()
    return joblib.load(MODEL_BUNDLE_PATH)


def _normalize_payload(payload: Dict[str, object], columns: List[str], defaults: Dict[str, float]) -> Dict[str, float]:
    record: Dict[str, float] = {}
    for column in columns:
        value = payload.get(column, defaults.get(column, 0))
        record[column] = float(value)
    return record


def _build_alerts(vitals: Dict[str, float], symptoms: Dict[str, float], disease_flags: Dict[str, int], adherence_risk: int) -> List[str]:
    alerts: List[str] = []
    if vitals["heart_rate_resting"] > 95:
        alerts.append("Resting heart rate appears elevated.")
    if vitals["sleep_hours"] < 6:
        alerts.append("Sleep duration is below healthy baseline.")
    if vitals["activity_minutes"] < 20:
        alerts.append("Physical activity is significantly low.")
    if symptoms["shortness_of_breath"] >= 1:
        alerts.append("Shortness of breath reported. Consider prompt medical review.")
    if adherence_risk == 1:
        alerts.append("Medication adherence risk is high based on recent dose behavior.")
    for label, flag in disease_flags.items():
        if flag == 1:
            alerts.append(f"Model indicates elevated {label.replace('risk_', '').replace('_', ' ')} risk.")
    return alerts


def _build_suggestions(disease_flags: Dict[str, int], adherence_risk: int, future_risk_score: float) -> List[str]:
    suggestions: List[str] = []
    if disease_flags["risk_diabetes"] == 1:
        suggestions.append("Track fasting glucose and limit high-sugar meals.")
    if disease_flags["risk_heart_disease"] == 1:
        suggestions.append("Monitor blood pressure and prioritize low-sodium nutrition.")
    if disease_flags["risk_stress"] == 1:
        suggestions.append("Use stress-reduction habits like breathing exercises and short walks.")
    if adherence_risk == 1:
        suggestions.append("Enable medicine reminders and keep doses tied to daily routines.")
    if future_risk_score > 0.6:
        suggestions.append("Risk trend is rising. Schedule a preventive check-up this month.")
    if not suggestions:
        suggestions.append("Current trend looks stable. Continue tracking your daily health signals.")
    return suggestions


def _future_risk_from_history(history: List[Dict[str, float]]) -> Tuple[float, str]:
    if not history or len(history) < 3:
        return 0.45, "Not enough history for trend forecast. Add at least 3 logs."

    frame = pd.DataFrame(history)
    for column in ["heart_rate_resting", "sleep_hours", "activity_minutes"]:
        if column not in frame.columns:
            frame[column] = 0.0
    frame = frame.fillna(0.0)

    risk_series = (
        0.02 * frame["heart_rate_resting"]
        + 0.35 * np.maximum(0, 7 - frame["sleep_hours"])
        + 0.01 * np.maximum(0, 40 - frame["activity_minutes"])
    )
    x_values = np.arange(len(risk_series))
    slope = float(np.polyfit(x_values, risk_series, 1)[0])
    normalized = float(np.clip((risk_series.iloc[-1] / 5.5) + (slope / 2.0), 0, 1))
    trend = "rising" if slope > 0.03 else "falling" if slope < -0.03 else "stable"
    return normalized, f"Future risk trend appears {trend} based on recent wellness timeline."


def predict_health_intelligence(payload: Dict[str, object]) -> Dict[str, object]:
    bundle = _ensure_bundle()

    vital_cols = bundle["vital_columns"]
    symptom_cols = bundle["symptom_columns"]
    adherence_cols = bundle["adherence_columns"]
    disease_model = bundle["disease_model"]
    adherence_model = bundle["adherence_model"]

    vitals = _normalize_payload(
        payload,
        vital_cols,
        {"heart_rate_resting": 75, "sleep_hours": 7, "activity_minutes": 35, "wearable_source": 1},
    )
    symptoms = _normalize_payload(payload, symptom_cols, {key: 0 for key in symptom_cols})
    adherence = _normalize_payload(
        payload,
        adherence_cols,
        {
            "medications_count": 2,
            "missed_doses_last_week": 0,
            "late_doses_last_week": 1,
            "reminders_enabled": 1,
            "caregiver_support": 0,
        },
    )

    disease_frame = pd.DataFrame([{**vitals, **symptoms}])[vital_cols + symptom_cols]
    disease_probs = disease_model.predict_proba(disease_frame)
    disease_pred = disease_model.predict(disease_frame)[0]
    disease_flags = {name: int(flag) for name, flag in zip(TARGETS, disease_pred)}
    disease_confidence = {
        name: round(float(model_probs[0][1]), 3) for name, model_probs in zip(TARGETS, disease_probs)
    }

    adherence_frame = pd.DataFrame([adherence])[adherence_cols]
    adherence_risk = int(adherence_model.predict(adherence_frame)[0])
    adherence_prob = round(float(adherence_model.predict_proba(adherence_frame)[0][1]), 3)

    future_risk_score, future_note = _future_risk_from_history(payload.get("time_series", []))
    alerts = _build_alerts(vitals, symptoms, disease_flags, adherence_risk)
    suggestions = _build_suggestions(disease_flags, adherence_risk, future_risk_score)

    return {
        "input": {"vitals": vitals, "symptoms": symptoms, "adherence": adherence},
        "predictions": {
            **disease_flags,
            "adherence_risk": adherence_risk,
            "future_health_risk_score": round(future_risk_score, 3),
        },
        "confidence": {
            **disease_confidence,
            "adherence_risk": adherence_prob,
            "future_health_risk_score": round(future_risk_score, 3),
        },
        "alerts": alerts,
        "suggestions": suggestions,
        "future_risk_note": future_note,
    }


def chat_doctor_assistant(message: str, latest_prediction: Optional[Dict[str, object]] = None) -> Dict[str, object]:
    normalized = (message or "").strip().lower()
    reply = "I can help explain your risks, medication adherence, symptoms, and next health steps."

    if "adherence" in normalized or "missed dose" in normalized:
        reply = "Set fixed medicine times, enable reminders, and keep doses near routine events like meals."
    elif "stress" in normalized:
        reply = "For stress control, prioritize sleep regularity and include two short relaxation breaks daily."
    elif "heart" in normalized:
        reply = "Keep resting heart rate and blood pressure monitored, reduce sodium intake, and stay active."
    elif "diabetes" in normalized or "sugar" in normalized:
        reply = "Track fasting glucose weekly and reduce refined carbs to lower diabetes risk."
    elif "emergency" in normalized or "chest pain" in normalized:
        reply = "If you have chest pain, severe breathlessness, or sudden weakness, seek emergency care immediately."

    if latest_prediction and latest_prediction.get("predictions", {}).get("future_health_risk_score", 0) > 0.7:
        reply += " Your projected future risk is elevated, so consider a doctor follow-up soon."

    return {
        "reply": reply,
        "disclaimer": "AI assistant only. Not a medical diagnosis. Consult a licensed clinician for treatment decisions.",
    }


def main() -> None:
    sample_payload = {
        "heart_rate_resting": 98,
        "sleep_hours": 5.5,
        "activity_minutes": 19,
        "wearable_source": 1,
        "fatigue": 1,
        "shortness_of_breath": 1,
        "medications_count": 3,
        "missed_doses_last_week": 4,
        "late_doses_last_week": 3,
        "reminders_enabled": 0,
        "caregiver_support": 0,
        "time_series": [
            {"heart_rate_resting": 88, "sleep_hours": 6.9, "activity_minutes": 36},
            {"heart_rate_resting": 93, "sleep_hours": 6.2, "activity_minutes": 30},
            {"heart_rate_resting": 98, "sleep_hours": 5.5, "activity_minutes": 19},
        ],
    }
    result = predict_health_intelligence(sample_payload)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
