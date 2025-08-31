import React, { useState } from "react";

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
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: "auto", padding: 16 }}>
      <h2>Dosha Assessment Form</h2>

      <label>
        Patient Name:
        <input
          name="patientName"
          value={formData.patientName}
          onChange={handleChange}
          style={{ marginBottom: 8, width: "100%" }}
        />
        {errors.patientName && <div style={{ color: "red" }}>{errors.patientName}</div>}
      </label>

      {Object.entries(OPTIONS).map(([field, choices]) => (
        <div key={field} style={{ margin: "16px 0" }}>
          <div style={{ fontWeight: "bold", marginBottom: 8, textTransform: "capitalize" }}>
            {field.replace(/([A-Z])/g, " $1")}
          </div>
          {choices.map((choice) => (
            <label key={choice} style={{ marginRight: 12 }}>
              <input
                type="radio"
                name={field}
                value={choice}
                checked={formData[field] === choice}
                onChange={handleChange}
              />{" "}
              {choice}
            </label>
          ))}
          {errors[field] && <div style={{ color: "red" }}>{errors[field]}</div>}
        </div>
      ))}

      <button type="submit">Complete Assessment</button>
    </form>
  );
}
