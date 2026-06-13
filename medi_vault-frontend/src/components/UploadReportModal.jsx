import React, { useState, useEffect } from "react";
import "./UploadReportModal.css";

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
  const [type, setType] = useState(() => {
    // Handle invalid default types (like 'all')
    const validTypes = REPORT_TYPES.map(t => t.value);
    return (defaultType && validTypes.includes(defaultType)) ? defaultType : "lab";
  });
  const [doctor, setDoctor] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Handle invalid default types (like 'all')
    const validTypes = REPORT_TYPES.map(t => t.value);
    setType((defaultType && validTypes.includes(defaultType)) ? defaultType : "lab");
  }, [defaultType]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please select a file to upload.");
    if (!doctor.trim()) return setError("Please enter doctor's name.");
    if (!title.trim()) return setError("Please enter the report title.");

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).token : null;
      if (!token) throw new Error("Not authenticated");

      const API_URL = process.env.REACT_APP_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3000' : 'https://medi-vault-zsg1.onrender.com');

      const formData = new FormData();
      formData.append("category", type);
      formData.append("doctor", doctor);
      formData.append("title", title);
      formData.append("date", date);
      formData.append("file", file);

      const res = await fetch(`${API_URL}/api/medical-history/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
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
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Upload Medical Report</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} required>
              {REPORT_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Doctor's Name</label>
            <input
              type="text"
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              placeholder="Doctor's Name"
              required
            />
          </div>

          <div className="form-group">
            <label>Report Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter report title"
              required
            />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>File</label>
            <input type="file" accept="application/pdf,image/*" onChange={handleFileChange} required />
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="modal-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Uploading..." : "Upload"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

