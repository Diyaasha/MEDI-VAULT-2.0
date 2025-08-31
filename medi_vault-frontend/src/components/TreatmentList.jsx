import React from "react";

export default function TreatmentList({ treatments, onEdit, onDelete }) {
  if (!treatments || treatments.length === 0) {
    return <p>No treatments found.</p>;
  }

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {treatments.map((treatment) => (
        <li key={treatment._id} style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 16,
          marginBottom: 12
        }}>
          <strong>{treatment.name}</strong> ({treatment.type})<br />
          Status: {treatment.status}<br />
          Duration: {new Date(treatment.startDate).toLocaleDateString()}{" "}
          {treatment.endDate ? `- ${new Date(treatment.endDate).toLocaleDateString()}` : ""}
          <p>{treatment.dosageFrequency}</p>
          {treatment.notes && <p>Notes: {treatment.notes}</p>}
          <button onClick={() => onEdit(treatment)}>Edit</button>
          <button onClick={() => onDelete(treatment._id)} style={{ marginLeft: 8 }}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
