import React, { useState } from "react";
import TreatmentForm from "./TreatmentForm";
import "./TreatmentPlanTab.css";   // 👈 import css

export default function TreatmentPlansTab({ treatments, onSavePlan, onDeletePlan }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAddNew = () => {
    setSelectedPlan(null);
    setShowForm(true);
    setError(null);
  };

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setShowForm(true);
    setError(null);
  };

  const handleCancel = () => {
    setSelectedPlan(null);
    setShowForm(false);
    setError(null);
  };

  const handleSave = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      await onSavePlan(formData, selectedPlan);
      setShowForm(false);
      setSelectedPlan(null);
    } catch (err) {
      setError(err.message || "Error saving plan");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this treatment plan?")) return;
    setLoading(true);
    setError(null);
    try {
      await onDeletePlan(id);
    } catch (err) {
      setError(err.message || "Error deleting plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Treatment Plans</h2>

      {loading && <p>Processing...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!showForm ? (
        <>
          {treatments.length === 0 && <p>No treatment plans found.</p>}

          {/* Styled Button */}
          <button onClick={handleAddNew} className="createButton">
            + Create New Plan
          </button>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 16 }}>
            {treatments.map((plan) => (
              <div
                key={plan._id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 16,
                  width: 280,
                  boxSizing: "border-box",
                }}
              >
                <strong>{plan.patientName}</strong> <br />
                Constitution: {plan.primaryConstitution} <br />
                Start: {plan.startDate ? new Date(plan.startDate).toLocaleDateString() : "N/A"} <br />
                Duration: {plan.durationValue} {plan.durationUnit} <br />
                Treatments: {plan.treatmentModalities} <br />
                Progress: {plan.calculatedProgressPercent || 0}% <br />
                <div style={{ margin: "8px 0" }}>
                  <div style={{ background: "#ddd", borderRadius: 4, height: 16, width: "100%" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${plan.calculatedProgressPercent || 0}%`,
                        backgroundColor: "#1976d2",
                        borderRadius: 4,
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>
                Status: {plan.status} <br />
                <button onClick={() => handleEdit(plan)} style={{ marginRight: 8 }}>
                  Edit
                </button>
                <button onClick={() => handleDelete(plan._id)}>Delete</button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <TreatmentForm
          treatment={selectedPlan}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
