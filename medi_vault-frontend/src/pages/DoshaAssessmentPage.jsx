import React, { useState } from "react";
import DoshaAssessmentForm from "../components/DoshaAssessmentForm";
import DoshaAssessmentResult from "../components/DoshaAssessmentResult";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

export default function DoshaAssessmentPage() {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).token : null;

  const handleSubmit = async (formData) => {
    if (!token) {
      alert("Please login to complete assessment.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/dosha-assessments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setAssessment(data);
      } else {
        const errData = await res.json();
        setError(errData.message || "Failed to complete assessment");
      }
    } catch (err) {
      setError("Network error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      {!assessment && <DoshaAssessmentForm onSubmit={handleSubmit} />}
      {loading && <p>Completing assessment...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {assessment && <DoshaAssessmentResult assessment={assessment} />}
    </div>
  );
}
