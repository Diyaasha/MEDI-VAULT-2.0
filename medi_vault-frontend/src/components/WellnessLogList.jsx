import React, { useEffect, useState } from "react";
import styles from "./WellnessTracking.module.css";


const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

export default function WellnessLogList({ onEdit, reloadList }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).token : null;

  const fetchLogs = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/wellness-logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to load wellness logs");
      }
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this log?")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/wellness-logs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete log");
      await fetchLogs();
      reloadList && reloadList();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading wellness logs...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!logs.length) return <p>No wellness logs found.</p>;

 return (
  <ul style={{ listStyle: "none", padding: 0 }}>
    {logs.map((log) => (
      <li key={log._id} className={styles.logItem}>
        <strong>{new Date(log.date).toLocaleDateString()}</strong><br />
        Mood: {log.mood} / 10 <br />
        Sleep Hours: {log.sleepHours || "N/A"} <br />
        Energy Level: {log.energyLevel} / 10 <br />
        Diet Notes: {log.dietNotes || "-"} <br />
        Notes: {log.notes || "-"} <br />

        <div className={styles.logButtons}>
          <button onClick={() => onEdit(log)} className={styles.logButton}>
            Edit
          </button>
          <button
            onClick={() => handleDelete(log._id)}
            className={`${styles.logButton} ${styles.logButtonDelete}`}
          >
            Delete
          </button>
        </div>
      </li>
    ))}
  </ul>
);

}
