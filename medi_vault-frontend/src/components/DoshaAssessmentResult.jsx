import React from "react";

function ProgressBar({ label, value, color }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontWeight: "bold", color }}>{label}</div>
      <div
        style={{
          background: "#ddd",
          borderRadius: 4,
          height: 16,
          width: "100%",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${value}%`,
            backgroundColor: color,
            transition: "width 0.5s ease-in-out",
          }}
        />
      </div>
      <div>{value}%</div>
    </div>
  );
}

const COLORS = {
  Vata: "#1e88e5",
  Pitta: "#e53935",
  Kapha: "#43a047",
};

export default function DoshaAssessmentResult({ assessment }) {
  if (!assessment) return null;

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 16 }}>
      <h2>Assessment Results</h2>

      <ProgressBar label="Vata" value={assessment.vataPercent} color={COLORS.Vata} />
      <ProgressBar label="Pitta" value={assessment.pittaPercent} color={COLORS.Pitta} />
      <ProgressBar label="Kapha" value={assessment.kaphaPercent} color={COLORS.Kapha} />

      <div style={{ marginTop: 16, padding: 12, backgroundColor: "#f0f4f8", borderRadius: 6 }}>
        <strong style={{ color: COLORS[assessment.primaryConstitution] }}>
          Primary Constitution: {assessment.primaryConstitution}
        </strong>
        <p>{assessment.recommendations}</p>
      </div>
    </div>
  );
}
