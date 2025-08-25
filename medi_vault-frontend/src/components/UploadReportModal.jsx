import React, { useState, useEffect } from "react";

const REPORT_TYPES = [
  { value: "lab", label: "Lab Results" },
  { value: "imaging", label: "Imaging" },
  { value: "prescription", label: "Prescriptions" },
  { value: "visit-summary", label: "Visit Summary" },
  { value: "immunization", label: "Immunizations" },
  { value: "insurance", label: "Insurance" },
  { value: "specialist", label: "Specialists" },
  { value: "emergency", label: "Emergency" },
  { value: "uploaded", label: "Uploaded" },
];

export default function UploadReportModal({ isOpen, onClose, defaultType, onUploaded }) {
  const [type, setType] = useState(defaultType || "lab");
  const [doctor, setDoctor] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setType(defaultType || "lab");
  }, [defaultType]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    if (!doctor.trim()) {
      setError("Please enter doctor's name.");
      return;
    }
    if (!title.trim()) {
      setError("Please enter the report title.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).token : null;
      if (!token) throw new Error("Not authenticated");

      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

      const formData = new FormData();
      formData.append("category", type);
      formData.append("doctor", doctor);
      formData.append("title", title);
      formData.append("date", date);
      formData.append("file", file);

      const res = await fetch(`${API_URL}/api/medical-history/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        setDoctor("");
        setTitle("");
        setFile(null);
        setDate(new Date().toISOString().slice(0, 10));
        if (onUploaded) onUploaded();
        onClose();
      } else {
        const json = await res.json();
        setError(json.message || "Upload failed.");
      }
    } catch (err) {
      setError(err.message || "Upload failed.");
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div onClick={onClose} style={modalBackdropStyle}>
      <div onClick={e => e.stopPropagation()} style={modalStyle}>
        <h2>Upload Medical Report</h2>
        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label>Type</label>
            <select value={type} onChange={e => setType(e.target.value)} required>
              {REPORT_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div style={fieldStyle}>
            <label>Doctor's Name</label>
            <input
              type="text"
              value={doctor}
              onChange={e => setDoctor(e.target.value)}
              placeholder="Doctor's Name"
              required
            />
          </div>
          <div style={fieldStyle}>
            <label>Report Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter report title"
              required
            />
          </div>
          <div style={fieldStyle}>
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>
          <div style={fieldStyle}>
            <label>File</label>
            <input type="file" accept="application/pdf,image/*" onChange={handleFileChange} required />
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <div style={{ marginTop: 16, display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="submit" disabled={loading}>{loading ? "Uploading..." : "Upload"}</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const modalBackdropStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle = {
  backgroundColor: "#fff",
  padding: 24,
  borderRadius: 6,
  width: "90%",
  maxWidth: 400,
};

const fieldStyle = {
  marginBottom: 12,
  display: "flex",
  flexDirection: "column",
};

