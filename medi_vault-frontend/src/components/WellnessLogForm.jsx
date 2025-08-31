import React, { useState, useEffect } from "react";
import styles from "./WellnessTracking.module.css";


const inputStyle = {
  width: "100%",
  padding: "8px",
  marginBottom: 12,
  borderRadius: 4,
  border: "1px solid #ccc",
  fontSize: 14,
};

export default function WellnessLogForm({ log, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    date: "",
    mood: 5,
    sleepHours: "",
    energyLevel: 5,
    dietNotes: "",
    notes: "",
  });

  useEffect(() => {
    if (log) {
      setFormData({
        date: log.date ? log.date.slice(0, 10) : "",
        mood: log.mood || 5,
        sleepHours: log.sleepHours || "",
        energyLevel: log.energyLevel || 5,
        dietNotes: log.dietNotes || "",
        notes: log.notes || "",
      });
    }
  }, [log]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "mood" || name === "energyLevel" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.date) {
      alert("Please select a date.");
      return;
    }
    if (formData.mood < 1 || formData.mood > 10) {
      alert("Mood must be between 1 and 10.");
      return;
    }
    if (formData.energyLevel < 1 || formData.energyLevel > 10) {
      alert("Energy Level must be between 1 and 10.");
      return;
    }
    if (formData.sleepHours && (formData.sleepHours < 0 || formData.sleepHours > 24)) {
      alert("Sleep hours must be between 0 and 24.");
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={`${styles.wellnessContainer} ${styles.fadeIn}`}>
    <h2>{log ? "Edit" : "Add"} Wellness Log</h2>

    {/* Date field alone */}
    <div className={styles.formGroup}>
      <div className={styles.formColumn}>
        <label className={styles.formLabel}>
          Date:
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className={styles.formInput}
          />
        </label>
      </div>
    </div>

    {/* Mood, Sleep, Energy row */}
    <div className={styles.formGroup}>
      <div className={styles.formColumn}>
        <label className={styles.formLabel}>
          Mood (1-10):
          <input
            type="number"
            name="mood"
            value={formData.mood}
            onChange={handleChange}
            min={1}
            max={10}
            required
            className={styles.formInput}
          />
        </label>
      </div>
      <div className={styles.formColumn}>
        <label className={styles.formLabel}>
          Sleep Hours:
          <input
            type="number"
            name="sleepHours"
            value={formData.sleepHours}
            onChange={handleChange}
            min={0}
            max={24}
            step={0.1}
            className={styles.formInput}
          />
        </label>
      </div>
      <div className={styles.formColumn}>
        <label className={styles.formLabel}>
          Energy Level (1-10):
          <input
            type="number"
            name="energyLevel"
            value={formData.energyLevel}
            onChange={handleChange}
            min={1}
            max={10}
            required
            className={styles.formInput}
          />
        </label>
      </div>
    </div>

    {/* Diet notes (full width) */}
    <div className={styles.formGroup}>
      <div className={styles.formColumn}>
        <label className={styles.formLabel}>
          Diet Notes:
          <textarea
            name="dietNotes"
            value={formData.dietNotes}
            onChange={handleChange}
            rows={2}
            className={styles.formTextarea}
            placeholder="e.g. Ate light meals, avoided sugar"
          />
        </label>
      </div>
    </div>

    {/* Additional notes (full width) */}
    <div className={styles.formGroup}>
      <div className={styles.formColumn}>
        <label className={styles.formLabel}>
          Additional Notes:
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            className={styles.formTextarea}
          />
        </label>
      </div>
    </div>

    {/* Buttons row */}
    <div className={styles.buttonRow}>
      <button type="submit" className={styles.buttonPrimary}>
        {log ? "Update" : "Add"} Log
      </button>
      <button
        type="button"
        onClick={onCancel}
        className={styles.buttonPrimary}
        style={{ backgroundColor: "#555" }}
      >
        Cancel
      </button>
    </div>
  </form>
);

}
