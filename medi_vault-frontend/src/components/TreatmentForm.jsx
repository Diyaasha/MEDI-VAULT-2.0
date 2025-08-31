import React, { useState, useEffect } from "react";
import "./TreatmentForm.css";

const TREATMENT_TYPES = [
  "Medicine",
  "Therapy",
  "Lifestyle",
  "Diet",
  "Ayurveda",
  "Other",
];

const STATUS_OPTIONS = ["Active", "Completed", "Paused"];
const DURATION_UNITS = ["days", "weeks", "months"];
const CONSTITUTIONS = ["Vata", "Pitta", "Kapha"];

export default function TreatmentForm({ treatment, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    patientName: "",
    primaryConstitution: "",
    treatmentModalities: "",
    treatmentGoals: "",
    type: "Medicine",
    name: "",
    startDate: "",
    endDate: "",
    dosageFrequency: "",
    status: "Active",
    notes: "",
    durationValue: "",
    durationUnit: "days",
  });

  useEffect(() => {
    if (treatment) {
      setFormData({
        patientName: treatment.patientName || "",
        primaryConstitution: treatment.primaryConstitution || "",
        treatmentModalities: treatment.treatmentModalities || "",
        treatmentGoals: treatment.treatmentGoals || "",
        type: treatment.type || "Medicine",
        name: treatment.name || "",
        startDate: treatment.startDate ? treatment.startDate.slice(0, 10) : "",
        endDate: treatment.endDate ? treatment.endDate.slice(0, 10) : "",
        dosageFrequency: treatment.dosageFrequency || "",
        status: treatment.status || "Active",
        notes: treatment.notes || "",
        durationValue: treatment.durationValue || "",
        durationUnit: treatment.durationUnit || "days",
      });
    }
  }, [treatment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.patientName ||
      !formData.primaryConstitution ||
      !formData.treatmentModalities ||
      !formData.startDate ||
      !formData.durationValue ||
      !formData.durationUnit ||
      !formData.status
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    onSave(formData);
  };

  return (
    <form className="treatment-form" onSubmit={handleSubmit}>
      <h2 className="form-title">Treatment Plan</h2>

      <div className="form-group">
        <label>Patient Name</label>
        <input type="text" name="patientName" value={formData.patientName} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label>Primary Constitution</label>
        <select name="primaryConstitution" value={formData.primaryConstitution} onChange={handleChange} required>
          <option value="">Select Constitution</option>
          {CONSTITUTIONS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Treatment Modalities</label>
        <input type="text" name="treatmentModalities" value={formData.treatmentModalities} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label>Treatment Goals</label>
        <input type="text" name="treatmentGoals" value={formData.treatmentGoals} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Type</label>
        <select name="type" value={formData.type} onChange={handleChange} required>
          {TREATMENT_TYPES.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Name</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Start Date</label>
          <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>End Date</label>
          <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
        </div>
      </div>

      <div className="form-group">
        <label>Dosage / Frequency</label>
        <input type="text" name="dosageFrequency" value={formData.dosageFrequency} onChange={handleChange} />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Duration Value</label>
          <input type="number" name="durationValue" value={formData.durationValue} min={1} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Duration Unit</label>
          <select name="durationUnit" value={formData.durationUnit} onChange={handleChange} required>
            {DURATION_UNITS.map((unit) => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Status</label>
        <select name="status" value={formData.status} onChange={handleChange} required>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Notes</label>
        <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn save">Save</button>
        <button type="button" className="btn cancel" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
