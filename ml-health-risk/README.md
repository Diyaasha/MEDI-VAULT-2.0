# Health Risk Predictor (Python)

This module predicts:
- Disease risk from vitals + symptoms (Logistic Regression)
- Medicine adherence behavior risk (Decision Tree)
- Future health risk trend from time-series logs

Based on:
- Resting heart rate, sleep, activity, source type
- Symptom flags (fatigue, shortness of breath, etc.)
- Adherence signals (missed and late doses)
- Recent time-series logs for trend estimation

It also returns:
- Alerts
- Personalized suggestions
- Confidence scores
- AI doctor assistant chatbot responses

## Stack
- Python
- Pandas
- Scikit-learn
- Flask API

## Setup
```bash
cd ml-health-risk
python -m venv .venv
source .venv/Scripts/activate   # Windows bash
pip install -r requirements.txt
```

## Train model
```bash
python train_model.py
```

## Run local prediction test
```bash
python predict.py
```

## Start API service
```bash
python api.py
```

Service runs on: `http://localhost:5050`

## API endpoints

### GET /health
Simple status check.

### POST /predict
Request body example:
```json
{
  "heart_rate_resting": 96,
  "sleep_hours": 5.8,
  "activity_minutes": 22,
  "wearable_source": 1,
  "fatigue": 1,
  "shortness_of_breath": 0,
  "medications_count": 3,
  "missed_doses_last_week": 2,
  "late_doses_last_week": 2,
  "reminders_enabled": 1,
  "caregiver_support": 0,
  "time_series": [
    {"heart_rate_resting": 84, "sleep_hours": 7.1, "activity_minutes": 38},
    {"heart_rate_resting": 92, "sleep_hours": 6.2, "activity_minutes": 24},
    {"heart_rate_resting": 96, "sleep_hours": 5.8, "activity_minutes": 22}
  ]
}
```

### POST /chat-assistant
Request body example:
```json
{
  "message": "How do I improve adherence?"
}
```

Response example:
```json
{
  "reply": "Set fixed medicine times, enable reminders, and keep doses near routine events like meals.",
  "disclaimer": "AI assistant only. Not a medical diagnosis. Consult a licensed clinician for treatment decisions."
}
```

## Integration idea with your Node backend
- In Express, call this service with `axios.post("http://localhost:5050/predict", payload)`.
- Store the response inside your wellness log data model.
- Show `alerts` and `suggestions` in dashboard cards and notification banners.

## Notes
- Current model is trained on synthetic data for demo/prototyping.
- For production, retrain using validated clinical or wearable datasets.
