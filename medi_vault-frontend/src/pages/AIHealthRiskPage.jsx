import React, { useMemo, useState } from "react";
import usePageTitle from "../hooks/usePageTitle";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const API_BASE = process.env.REACT_APP_AI_RISK_URL || "http://127.0.0.1:5050";

function RiskBadge({ label, value }) {
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 10,
        border: "1px solid #d9e2f3",
        background: "#f7faff",
      }}
    >
      <strong>{label}</strong>
      <div style={{ marginTop: 6, color: value ? "#b42318" : "#067647" }}>
        {value ? "Elevated" : "Low"}
      </div>
    </div>
  );
}

export default function AIHealthRiskPage() {
  usePageTitle("AI Health Risk Prediction");
  const [form, setForm] = useState({
    heart_rate_resting: 85,
    sleep_hours: 7,
    activity_minutes: 35,
    wearable_source: 1,
    fever: 0,
    cough: 0,
    fatigue: 0,
    headache: 0,
    shortness_of_breath: 0,
    nausea: 0,
    medications_count: 2,
    missed_doses_last_week: 0,
    late_doses_last_week: 1,
    reminders_enabled: 1,
    caregiver_support: 0,
  });
  const [timeSeries] = useState([
    { day: "Day-1", heart_rate_resting: 84, sleep_hours: 7.1, activity_minutes: 38 },
    { day: "Day-2", heart_rate_resting: 87, sleep_hours: 6.6, activity_minutes: 33 },
    { day: "Today", heart_rate_resting: 85, sleep_hours: 7, activity_minutes: 35 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatReply, setChatReply] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const trendChartData = useMemo(
    () =>
      timeSeries.map((item) => ({
        day: item.day,
        "Risk Signal":
          item.heart_rate_resting * 0.02 +
          Math.max(0, 7 - item.sleep_hours) * 0.35 +
          Math.max(0, 40 - item.activity_minutes) * 0.01,
      })),
    [timeSeries]
  );

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          time_series: timeSeries.map(({ heart_rate_resting, sleep_hours, activity_minutes }) => ({
            heart_rate_resting,
            sleep_hours,
            activity_minutes,
          })),
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Prediction failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const askAssistant = async () => {
    if (!chatMessage.trim()) return;
    setChatLoading(true);
    setChatReply("");
    try {
      const response = await fetch(`${API_BASE}/chat-assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: chatMessage,
          latest_prediction: result,
        }),
      });
      const data = await response.json();
      setChatReply(`${data.reply}\n\n${data.disclaimer}`);
    } catch (err) {
      setChatReply("Unable to reach AI doctor assistant right now.");
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
      <h1>AI Health Intelligence Dashboard</h1>
      <p style={{ color: "#475467", marginBottom: 20 }}>
        Predict disease risk from symptoms, medicine adherence behavior, and future
        health trend from your recent time-series logs.
      </p>

      <form
        onSubmit={onSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <label>
          Resting Heart Rate
          <input
            name="heart_rate_resting"
            type="number"
            min="40"
            max="180"
            value={form.heart_rate_resting}
            onChange={onChange}
            style={{ width: "100%", padding: 10, marginTop: 4 }}
          />
        </label>

        <label>
          Sleep Hours
          <input
            name="sleep_hours"
            type="number"
            min="0"
            max="12"
            step="0.1"
            value={form.sleep_hours}
            onChange={onChange}
            style={{ width: "100%", padding: 10, marginTop: 4 }}
          />
        </label>

        <label>
          Daily Activity (minutes)
          <input
            name="activity_minutes"
            type="number"
            min="0"
            max="300"
            value={form.activity_minutes}
            onChange={onChange}
            style={{ width: "100%", padding: 10, marginTop: 4 }}
          />
        </label>

        <label>
          Data Source
          <select
            name="wearable_source"
            value={form.wearable_source}
            onChange={onChange}
            style={{ width: "100%", padding: 10, marginTop: 4 }}
          >
            <option value={1}>Wearable</option>
            <option value={0}>Manual</option>
          </select>
        </label>

        <label>
          Fatigue
          <select name="fatigue" value={form.fatigue} onChange={onChange} style={{ width: "100%", padding: 10, marginTop: 4 }}>
            <option value={0}>No</option>
            <option value={1}>Yes</option>
          </select>
        </label>

        <label>
          Shortness of Breath
          <select name="shortness_of_breath" value={form.shortness_of_breath} onChange={onChange} style={{ width: "100%", padding: 10, marginTop: 4 }}>
            <option value={0}>No</option>
            <option value={1}>Yes</option>
          </select>
        </label>

        <label>
          Missed Doses (Last Week)
          <input
            name="missed_doses_last_week"
            type="number"
            min="0"
            max="21"
            value={form.missed_doses_last_week}
            onChange={onChange}
            style={{ width: "100%", padding: 10, marginTop: 4 }}
          />
        </label>

        <label>
          Late Doses (Last Week)
          <input
            name="late_doses_last_week"
            type="number"
            min="0"
            max="21"
            value={form.late_doses_last_week}
            onChange={onChange}
            style={{ width: "100%", padding: 10, marginTop: 4 }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "11px 16px",
            borderRadius: 8,
            border: "none",
            background: "#6941c6",
            color: "#fff",
            cursor: "pointer",
            alignSelf: "end",
          }}
        >
          {loading ? "Predicting..." : "Get AI Prediction"}
        </button>
      </form>

      {error && <p style={{ color: "#b42318" }}>{error}</p>}

      {result && (
        <div>
          <h2>Prediction Result</h2>

          <div
            style={{
              display: "grid",
              gap: 10,
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              marginBottom: 16,
            }}
          >
            <RiskBadge label="Diabetes Risk" value={result.predictions.risk_diabetes} />
            <RiskBadge
              label="Heart Disease Risk"
              value={result.predictions.risk_heart_disease}
            />
            <RiskBadge label="Stress Risk" value={result.predictions.risk_stress} />
            <RiskBadge label="Adherence Risk" value={result.predictions.adherence_risk} />
          </div>

          <p style={{ color: "#475467" }}>
            Future health risk score: <strong>{result.predictions.future_health_risk_score}</strong>
          </p>
          <p style={{ color: "#475467" }}>{result.future_risk_note}</p>

          <h3>Alerts</h3>
          <ul>
            {result.alerts.map((alert) => (
              <li key={alert}>{alert}</li>
            ))}
          </ul>

          <h3>Smart Suggestions</h3>
          <ul>
            {result.suggestions.map((suggestion) => (
              <li key={suggestion}>{suggestion}</li>
            ))}
          </ul>

          <h3 style={{ marginTop: 22 }}>Time-Series Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendChartData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="Risk Signal" stroke="#6941c6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>

          <h3 style={{ marginTop: 22 }}>AI Doctor Assistant</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={chatMessage}
              onChange={(event) => setChatMessage(event.target.value)}
              placeholder="Ask: How do I reduce stress risk?"
              style={{ flex: 1, padding: 10 }}
            />
            <button type="button" onClick={askAssistant} disabled={chatLoading} style={{ padding: "10px 14px" }}>
              {chatLoading ? "Thinking..." : "Ask"}
            </button>
          </div>
          {chatReply && (
            <pre
              style={{
                whiteSpace: "pre-wrap",
                background: "#f8f9fc",
                border: "1px solid #d8e0f2",
                borderRadius: 8,
                padding: 12,
                marginTop: 10,
                fontFamily: "inherit",
              }}
            >
              {chatReply}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
