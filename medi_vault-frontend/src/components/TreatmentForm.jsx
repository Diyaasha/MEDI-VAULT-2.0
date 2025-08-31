import React, { useState, useEffect } from "react";

const TREATMENT_TYPES = [
  "Medicine",
  "Therapy",
  "Lifestyle",
  "Diet",
  "Ayurveda",
  "Other",
];

const STATUS_OPTIONS = ["Active", "Completed", "Paused"]; // exact backend status enums

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
      alert("Please fill in all required fields including patient name, constitution, treatment modalities, start date, duration, and status.");
      return;
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16, maxWidth: 480 }}>
      <label>
        Patient Name:
        <input type="text" name="patientName" value={formData.patientName} onChange={handleChange} required />
      </label>
      <br /><br />

      <label>
        Primary Constitution:
        <select name="primaryConstitution" value={formData.primaryConstitution} onChange={handleChange} required>
          <option value="">Select Constitution</option>
          {CONSTITUTIONS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>
      <br /><br />

      <label>
        Treatment Modalities:
        <input type="text" name="treatmentModalities" value={formData.treatmentModalities} onChange={handleChange} required />
      </label>
      <br /><br />

      <label>
        Treatment Goals:
        <input type="text" name="treatmentGoals" value={formData.treatmentGoals} onChange={handleChange} />
      </label>
      <br /><br />

      <label>
        Type:
        <select name="type" value={formData.type} onChange={handleChange} required>
          {TREATMENT_TYPES.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </label>
      <br /><br />

      <label>
        Name:
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
      </label>
      <br /><br />

      <label>
        Start Date:
        <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
      </label>
      <br /><br />

      <label>
        End Date:
        <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
      </label>
      <br /><br />

      <label>
        Dosage / Frequency:
        <input type="text" name="dosageFrequency" value={formData.dosageFrequency} onChange={handleChange} />
      </label>
      <br /><br />

      <label>
        Duration Value:
        <input type="number" name="durationValue" value={formData.durationValue} min={1} onChange={handleChange} required />
      </label>
      <br /><br />

      <label>
        Duration Unit:
        <select name="durationUnit" value={formData.durationUnit} onChange={handleChange} required>
          {["days", "weeks", "months"].map((unit) => (
            <option key={unit} value={unit}>{unit}</option>
          ))}
        </select>
      </label>
      <br /><br />

      <label>
        Status:
        <select name="status" value={formData.status} onChange={handleChange} required>
          {["Active", "Completed", "Paused"].map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </label>
      <br /><br />

      <label>
        Notes:
        <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} />
      </label>
      <br /><br />

      <button type="submit">Save</button>
      <button type="button" onClick={onCancel} style={{ marginLeft: 8 }}>Cancel</button>
    </form>
  );
}
