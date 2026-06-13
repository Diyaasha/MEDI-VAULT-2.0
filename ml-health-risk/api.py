from flask import Flask, jsonify, request

from predict import chat_doctor_assistant, predict_health_intelligence


app = Flask(__name__)


@app.get("/health")
def health_check():
    return jsonify({"status": "ok"})


@app.post("/predict")
def predict():
    payload = request.get_json(silent=True) or {}
    result = predict_health_intelligence(payload)
    return jsonify(result)


@app.post("/chat-assistant")
def chat_assistant():
    payload = request.get_json(silent=True) or {}
    message = payload.get("message", "")
    latest_prediction = payload.get("latest_prediction")
    result = chat_doctor_assistant(message, latest_prediction)
    return jsonify(result)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050, debug=True)
