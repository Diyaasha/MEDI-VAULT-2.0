import React, { useState } from "react";
import "./DoshaAssessmentForm.css";

const OPTIONS = {
  bodyFrame: ["Thin, light", "Medium build", "Large, heavy"],
  skinType: ["Dry, rough", "Warm, oily", "Cool, moist"],
  sleepPattern: ["Light, restless", "Sound, moderate", "Deep, long"],
  appetite: ["Variable, irregular", "Strong, regular", "Slow, steady"],
};

export default function DoshaAssessmentForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    patientName: "",
    bodyFrame: "",
    skinType: "",
    sleepPattern: "",
    appetite: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.patientName.trim()) errs.patientName = "Patient name is required";
    Object.keys(OPTIONS).forEach((key) => {
      if (!formData[key]) errs[key] = "Please select a value";
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <form className="dosha-form" onSubmit={handleSubmit}>
      <h2>Dosha Assessment Form</h2>

      {/* Patient Name */}
      <div className="form-group">
        <label>Patient Name</label>
        <input
          name="patientName"
          value={formData.patientName}
          onChange={handleChange}
          className={errors.patientName ? "error" : ""}
        />
        {errors.patientName && <div className="error-text">{errors.patientName}</div>}
      </div>

      {/* Dynamic Options */}
      {Object.entries(OPTIONS).map(([field, choices]) => (
        <div key={field} className="form-group">
          <label className="field-label">
            {field.replace(/([A-Z])/g, " $1")}
          </label>
          <div className="radio-group">
            {choices.map((choice) => (
              <label key={choice} className="radio-option">
                <input
                  type="radio"
                  name={field}
                  value={choice}
                  checked={formData[field] === choice}
                  onChange={handleChange}
                />
                {choice}
              </label>
            ))}
          </div>
          {errors[field] && <div className="error-text">{errors[field]}</div>}
        </div>
      ))}

      <div className="form-actions">
        <button type="submit" className="submit-btn">
          Complete Assessment
        </button>
      </div>
    </form>
  );
}
