import React, { useEffect, useState, useCallback } from "react";
import "./MedicineReminder.css";

const MedicineReminder = () => {
  const [reminders, setReminders] = useState([]);
  const [formData, setFormData] = useState({
    medicineName: "",
    dose: "",
    frequency: "",
    startDate: "",
    endDate: "",
    notes: "",
  });
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")).token
    : null;
  const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:3000";

  const fetchReminders = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${baseUrl}/api/medicine-reminders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReminders(data);
      } else {
        console.error("Failed to fetch medicine reminders");
      }
    } catch (error) {
      console.error("Error fetching medicine reminders:", error);
    }
  }, [token, baseUrl]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return alert("Please login first.");

    const url = editingId
      ? `${baseUrl}/api/medicine-reminders/${editingId}`
      : `${baseUrl}/api/medicine-reminders`;

    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({
          medicineName: "",
          dose: "",
          frequency: "",
          startDate: "",
          endDate: "",
          notes: "",
        });
        setEditingId(null);
        fetchReminders();
      } else {
        const errorData = await res.json();
        alert("Error: " + errorData.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleEdit = (reminder) => {
    setFormData({
      medicineName: reminder.medicineName,
      dose: reminder.dose,
      frequency: reminder.frequency,
      startDate: reminder.startDate.slice(0, 10),
      endDate: reminder.endDate ? reminder.endDate.slice(0, 10) : "",
      notes: reminder.notes || "",
    });
    setEditingId(reminder._id);
  };

  const handleDelete = async (id) => {
    if (!token) return;
    if (!window.confirm("Are you sure you want to delete this reminder?")) return;

    try {
      const res = await fetch(`${baseUrl}/api/medicine-reminders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchReminders();
      } else {
        alert("Failed to delete reminder");
      }
    } catch (error) {
      console.error("Error deleting reminder:", error);
    }
  };

  return (
    <div className="medicine-reminder-page">
      <div className="medicine-reminder-container">
        <h2 className="medicine-reminder-title">Medicine Reminders</h2>

        <form onSubmit={handleSubmit} className="medicine-reminder-form">
          <input
            type="text"
            name="medicineName"
            placeholder="Medicine Name"
            value={formData.medicineName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="dose"
            placeholder="Dose (e.g. 500mg)"
            value={formData.dose}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="frequency"
            placeholder="Frequency (e.g. Twice a day)"
            value={formData.frequency}
            onChange={handleChange}
            required
          />
          <label>
            Start Date:
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            End Date:
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
            />
          </label>
          <textarea
            name="notes"
            placeholder="Notes"
            value={formData.notes}
            onChange={handleChange}
          />
          <div className="form-buttons">
            <button type="submit">
              {editingId ? "Update Reminder" : "Add Reminder"}
            </button>
            {editingId && (
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setFormData({
                    medicineName: "",
                    dose: "",
                    frequency: "",
                    startDate: "",
                    endDate: "",
                    notes: "",
                  });
                  setEditingId(null);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="medicine-reminders-list">
          {reminders.length === 0 && (
            <p className="no-reminders">No medicine reminders found.</p>
          )}
          {reminders.map((r) => (
            <div className="reminder-card" key={r._id}>
              <h3>{r.medicineName}</h3>
              <p>
                <span>Dose:</span> {r.dose} | <span>Frequency:</span> {r.frequency}
              </p>
              <p>
                <span>From:</span> {new Date(r.startDate).toLocaleDateString()}{" "}
                {r.endDate && (
                  <> - <span>To:</span> {new Date(r.endDate).toLocaleDateString()}</>
                )}
              </p>
              {r.notes && <p className="notes">Notes: {r.notes}</p>}
              <div className="actions">
                <button className="edit-btn" onClick={() => handleEdit(r)}>
                  Edit
                </button>
                <button className="delete-btn" onClick={() => handleDelete(r._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MedicineReminder;
