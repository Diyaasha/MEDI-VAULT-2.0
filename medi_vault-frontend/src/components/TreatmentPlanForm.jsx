import React, { useState, useEffect } from "react";
import "./TreatmentPlanForm.css"; // Import CSS file

const CONSTITUTIONS = ["Vata", "Pitta", "Kapha"];
const DURATIONS = ["2 weeks", "4 weeks", "6 weeks", "2 months", "3 months", "6 months"];

export default function TreatmentPlanForm({ plan, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    patientName: "",
    primaryConstitution: "Vata",
    startDate: "",
    duration: "2 weeks",
    treatmentModalities: "",
    treatmentGoals: "",
    status: "Active",
    progressPercent: 0,
    notes: "",
  });

  useEffect(() => {
    if (plan) {
      setFormData({
        patientName: plan.patientName || "",
        primaryConstitution: plan.primaryConstitution || "Vata",
        startDate: plan.startDate ? plan.startDate.slice(0, 10) : "",
        duration: plan.duration || "2 weeks",
        treatmentModalities: plan.treatmentModalities || "",
        treatmentGoals: plan.treatmentGoals || "",
        status: plan.status || "Active",
        progressPercent: plan.progressPercent || 0,
        notes: plan.notes || "",
      });
    }
  }, [plan]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="treatment-form">
      <h2 className="form-title">{plan ? "Edit Treatment Plan" : "Create Treatment Plan"}</h2>

      <label>Patient Name</label>
      <input
        name="patientName"
        value={formData.patientName}
        onChange={handleChange}
        required
      />

      <label>Primary Constitution</label>
      <select
        name="primaryConstitution"
        value={formData.primaryConstitution}
        onChange={handleChange}
        required
      >
        {CONSTITUTIONS.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <label>Start Date</label>
      <input
        type="date"
        name="startDate"
        value={formData.startDate}
        onChange={handleChange}
        required
      />

      <label>Duration</label>
      <select
        name="duration"
        value={formData.duration}
        onChange={handleChange}
        required
      >
        {DURATIONS.map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <label>Treatment Modalities</label>
      <textarea
        name="treatmentModalities"
        value={formData.treatmentModalities}
        onChange={handleChange}
        required
        placeholder="e.g. Abhyanga, Shirodhara, Panchakarma"
      />

      <label>Treatment Goals</label>
      <textarea
        name="treatmentGoals"
        value={formData.treatmentGoals}
        onChange={handleChange}
        placeholder="Define specific objectives"
      />

      <label>Status</label>
      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
      >
        <option value="Active">Active</option>
        <option value="Completed">Completed</option>
        <option value="Paused">Paused</option>
      </select>

      <label>Progress (%)</label>
      <input
        type="number"
        name="progressPercent"
        value={formData.progressPercent}
        onChange={handleChange}
        min={0}
        max={100}
      />

      <label>Notes</label>
      <textarea
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        placeholder="Any additional info"
      />

      <div className="form-actions">
        <button type="submit" className="btn primary">
          {plan ? "Update Plan" : "Create Plan"}
        </button>
        <button type="button" className="btn secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
