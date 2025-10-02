import React, { useState, useEffect } from "react";
import UploadReportModal from "../components/UploadReportModal";
import usePageTitle from '../hooks/usePageTitle';
import "./MedicalHistory.css";

const REPORT_TYPES = [
  { value: "lab", label: "Lab Results", icon: "🧪", desc: "Blood work, urine tests, biopsies" },
  { value: "imaging", label: "Imaging", icon: "📡", desc: "X-rays, MRIs, CT scans, ultrasounds" },
  { value: "prescription", label: "Prescriptions", icon: "💊", desc: "Current and past medications" },
  { value: "visit-summary", label: "Visit Summaries", icon: "📝", desc: "Doctor visit notes and plans" },
  { value: "immunization", label: "Immunizations", icon: "💉", desc: "Vaccination records and schedules" },
  { value: "insurance", label: "Insurance", icon: "🛡️", desc: "Coverage details and claims" },
  { value: "specialist", label: "Specialists", icon: "👨‍⚕️", desc: "Specialist consultations" },
  { value: "emergency", label: "Emergency", icon: "🚑", desc: "Emergency care records" },
  { value: "uploaded", label: "Uploaded", icon: "📂", desc: "Your uploaded reports" },
];

export default function MedicalHistory() {
  usePageTitle('Medical History');
  const [allReports, setAllReports] = useState([]);
  const [reports, setReports] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
  const token = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).token : null;

  useEffect(() => {
    async function fetchReports() {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/api/medical-history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAllReports(data);
        } else {
          setAllReports([]);
        }
      } catch {
        setAllReports([]);
      }
    }
    fetchReports();
  }, [token, API_URL]);

  useEffect(() => {
    let filtered = allReports;
    if (filterType !== "all") {
      filtered = filtered.filter((doc) => doc.category === filterType);
    }
    if (searchText.trim()) {
      const lowerSearch = searchText.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          (doc.title && doc.title.toLowerCase().includes(lowerSearch)) ||
          (doc.doctor && doc.doctor.toLowerCase().includes(lowerSearch))
      );
    }
    setReports(filtered);
  }, [allReports, filterType, searchText]);

  const openUploadModal = (type = null) => {
    // Don't use 'all' as upload type - default to 'lab' instead
    const uploadCategory = type || (filterType === 'all' ? 'lab' : filterType);
    setUploadType(uploadCategory);
    setModalOpen(true);
  };

  const handleUploadSuccess = () => {
    setModalOpen(false);
    async function fetchReports() {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/api/medical-history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAllReports(data);
        } else {
          setAllReports([]);
        }
      } catch {
        setAllReports([]);
      }
    }
    fetchReports();
  };

  const handleFeatureClick = (type) => {
    setFilterType(type);
    setUploadType(type);
    setModalOpen(true);
  };

  const openDocument = async (id) => {
    if (!token) {
      alert("Please login to download.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/medical-history/download-url/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const a = document.createElement("a");
        a.href = data.url;
        a.download = "";
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert("Failed to get download URL");
      }
    } catch {
      alert("Error downloading file");
    }
  };

  const deleteDocument = async (id) => {
    if (!token) {
      alert("Please login to delete.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      const res = await fetch(`${API_URL}/api/medical-history/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert("Document deleted");
        const updatedReports = allReports.filter((r) => r._id !== id);
        setAllReports(updatedReports);
      } else {
        alert("Failed to delete document");
      }
    } catch {
      alert("Error deleting document");
    }
  };

  return (
    <div className="mh-container">
      <h1 className="mh-title">Medical History Management System</h1>

      {/* Search & filter */}
      <div className="mh-filters">
        <input
          type="search"
          placeholder="Search by report or doctor"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="mh-search"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="mh-select"
        >
          <option value="all">All Types</option>
          {REPORT_TYPES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button onClick={() => openUploadModal()} className="mh-upload-btn">
          + Upload Report
        </button>
      </div>

      {/* Feature cards */}
      <div className="mh-card-grid">
        {REPORT_TYPES.filter(t => t.value !== "uploaded").map(({ value, label, icon, desc }) => (
          <div key={value} onClick={() => handleFeatureClick(value)} className="mh-card">
            <div className="mh-card-icon">{icon}</div>
            <div className="mh-card-title">{label}</div>
            <div className="mh-card-desc">{desc}</div>
          </div>
        ))}
      </div>

      {/* Document list */}
      {reports.length === 0 ? (
        <div className="mh-empty">
          <p>No reports found.</p>
          <p>Upload your first report to get started.</p>
        </div>
      ) : (
        <ul className="mh-report-list">
          {reports.map((r) => (
            <li key={r._id} className="mh-report-item">
              <h3>{r.title}</h3>
              <p><strong>Type:</strong> {REPORT_TYPES.find(t => t.value === r.category)?.label || r.category}</p>
              <p><strong>Date:</strong> {new Date(r.date).toLocaleDateString()}</p>
              <p><strong>Doctor:</strong> {r.doctor || "Unknown"}</p>
              <div className="mh-report-actions">
                {r.fileUrl && (
                  <button onClick={() => openDocument(r._id)} className="mh-btn-download">
                    Download Report
                  </button>
                )}
                <button onClick={() => deleteDocument(r._id)} className="mh-btn-delete">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <UploadReportModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultType={uploadType}
        onUploaded={handleUploadSuccess}
      />
    </div>
  );
}
