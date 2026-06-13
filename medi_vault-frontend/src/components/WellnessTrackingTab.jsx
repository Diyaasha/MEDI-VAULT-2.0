import React, { useState } from "react";
import WellnessLogList from "./WellnessLogList";
import WellnessLogForm from "./WellnessLogForm";
import WellnessTrendChart from "./WellnessTrendChart";
import styles from "./WellnessTracking.module.css";

export default function WellnessTrackingTab() {
  const [showForm, setShowForm] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [listKey, setListKey] = useState(0); // for forcing list reload

  const handleAddNew = () => {
    setSelectedLog(null);
    setShowForm(true);
  };

  const handleEdit = (log) => {
    setSelectedLog(log);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedLog(null);
  };

  const reloadList = () => {
    setListKey((prev) => prev + 1);
  };

  const handleSave = async (formData) => {
    const token = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).token : null;
    if (!token) {
      alert("Please login to continue.");
      return;
    }
    setShowForm(false);

    try {
      const API_BASE = process.env.REACT_APP_API_URL || "https://medi-vault-zsg1.onrender.com";
      const url = selectedLog
        ? `${API_BASE}/api/wellness-logs/${selectedLog._id}`
        : `${API_BASE}/api/wellness-logs`;
      const method = selectedLog ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const text = await res.text();
        let message = "Save failed";
        try {
          const jsonErr = JSON.parse(text);
          message = jsonErr.message || message;
        } catch {
          message = text || message;
        }
        throw new Error(message);
      }

      reloadList();
      setSelectedLog(null);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
  <div className={styles.wellnessContainer}>
    <h2>Wellness Tracking</h2>

    {!showForm && (
      <>
        <button onClick={handleAddNew} className={styles.buttonPrimary}>
          Add New Wellness Log
        </button>

        <div className={styles.gridContainer}>
          <div className={styles.fadeIn}>
            <WellnessTrendChart />
          </div>

          <div className={styles.fadeIn}>
            <WellnessLogList key={listKey} onEdit={handleEdit} reloadList={reloadList} />
          </div>
        </div>
      </>
    )}

    {showForm && (
      <div className={styles.fadeIn}>
        <WellnessLogForm log={selectedLog} onSave={handleSave} onCancel={handleCancel} />
      </div>
    )}
  </div>
  );
}
