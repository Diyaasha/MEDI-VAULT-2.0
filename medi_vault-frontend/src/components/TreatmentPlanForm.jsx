import React, { useState, useEffect } from "react";

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
    // Could add validation here
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "auto", padding: 16 }}>
      <h2>{plan ? "Edit" : "Create"} Treatment Plan</h2>

      <label>
        Patient Name:<br />
        <input
          name="patientName"
          value={formData.patientName}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: 12 }}
        />
      </label>

      <label>
        Primary Constitution:<br />
        <select
          name="primaryConstitution"
          value={formData.primaryConstitution}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: 12 }}
        >
          {CONSTITUTIONS.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>

      <label>
        Start Date:<br />
        <input
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: 12 }}
        />
      </label>

      <label>
        Duration:<br />
        <select
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: 12 }}
        >
          {DURATIONS.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </label>

      <label>
        Treatment Modalities:<br />
        <textarea
          name="treatmentModalities"
          value={formData.treatmentModalities}
          onChange={handleChange}
          required
          rows={3}
          style={{ width: "100%", marginBottom: 12 }}
          placeholder="e.g. Abhyanga, Shirodhara, Panchakarma"
        />
      </label>

      <label>
        Treatment Goals:<br />
        <textarea
          name="treatmentGoals"
          value={formData.treatmentGoals}
          onChange={handleChange}
          rows={2}
          style={{ width: "100%", marginBottom: 12 }}
          placeholder="Define specific objectives"
        />
      </label>

      <label>
        Status:<br />
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          style={{ width: "100%", marginBottom: 12 }}
        >
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Paused">Paused</option>
        </select>
      </label>

      <label>
        Progress (%):<br />
        <input
          type="number"
          name="progressPercent"
          value={formData.progressPercent}
          onChange={handleChange}
          min={0}
          max={100}
          style={{ width: 100, marginBottom: 12 }}
        />
      </label>

      <label>
        Notes:<br />
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          style={{ width: "100%", marginBottom: 12 }}
          placeholder="Any additional info"
        />
      </label>

      <button type="submit" style={{ marginRight: 12 }}>
        {plan ? "Update Plan" : "Create Plan"}
      </button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
}
