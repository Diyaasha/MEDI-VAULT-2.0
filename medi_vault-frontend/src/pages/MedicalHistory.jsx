import React, { useState, useEffect } from "react";
import UploadReportModal from "../components/UploadReportModal";

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

export default function MedicalHistory() {
  const [allReports, setAllReports] = useState([]);
  const [reports, setReports] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
  const token = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).token : null;

  // Fetch reports on mount and after upload/delete
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

  // Filter reports whenever allReports, filterType or searchText changes
  useEffect(() => {
    let filtered = allReports;

    if (filterType !== "all") {
      filtered = filtered.filter(
        (doc) =>
          doc.category === filterType ||
          (REPORT_TYPES.find((t) => t.value === doc.category)?.label === REPORT_TYPES.find((t) => t.value === filterType)?.label)
      );
    }

    if (searchText.trim()) {
  const lowerSearch = searchText.toLowerCase();
  filtered = filtered.filter(
    doc =>
      (doc.title && doc.title.toLowerCase().includes(lowerSearch)) ||
      (doc.doctor && doc.doctor.toLowerCase().includes(lowerSearch))
  );
}


    setReports(filtered);
  }, [allReports, filterType, searchText]);

  const openUploadModal = (type = null) => {
    setUploadType(type || filterType);
    setModalOpen(true);
  };

  const handleUploadSuccess = () => {
    setModalOpen(false);
    // Refetch after successful upload
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

  // Download document
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

  // Delete document
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
        // Refetch to update list
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
    <div style={{ maxWidth: 900, margin: "auto", padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: 24 }}>Medical History Management System</h1>

      {/* Search and filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="search"
          placeholder="Search by report or doctor"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ flexGrow: 1, minWidth: 200, padding: 12, fontSize: 16, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ padding: 12, fontSize: 16, borderRadius: 6, border: "1px solid #ccc", minWidth: 200 }}
        >
          <option value="all">All Types</option>
          {REPORT_TYPES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button
          onClick={() => openUploadModal()}
          style={{
            background: "linear-gradient(to right, #4caf50, #81c784)",
            color: "white",
            border: "none",
            borderRadius: 6,
            fontSize: 16,
            padding: "12px 24px",
            cursor: "pointer",
          }}
        >
          + Upload Report
        </button>
      </div>

      {/* Feature cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 16, marginBottom: 32 }}>
        {REPORT_TYPES.filter(t => t.value !== "uploaded").map(({ value, label }) => (
          <div
            key={value}
            onClick={() => handleFeatureClick(value)}
            style={{
              background: "#f9f9f9",
              borderRadius: 12,
              padding: 20,
              cursor: "pointer",
              textAlign: "center",
              boxShadow: "0 2px 8px rgb(0 0 0 / 0.1)",
              userSelect: "none",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <div style={{ fontSize: 28, fontWeight: "600", marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 12, color: "#555" }}>{label} Documents</div>
          </div>
        ))}
      </div>

      {/* Document list */}
      {reports.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: 60, color: "#777", fontSize: 18 }}>
          <p>No reports found.</p>
          <p>Upload your first report to get started.</p>
        </div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {reports.map((r) => (
            <li key={r._id} style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              marginBottom: 16,
              padding: 16,
              position: "relative",
            }}>
              <h3>{r.title}</h3>
              <p><strong>Type:</strong> {REPORT_TYPES.find(t => t.value === r.category)?.label || r.category}</p>
              <p><strong>Date:</strong> {new Date(r.date).toLocaleDateString()}</p>
              <p><strong>Doctor:</strong> {r.doctor || "Unknown"}</p>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                {r.fileUrl && (
                  <button
                    onClick={() => openDocument(r._id)}
                    style={{
                      background: "#1976d2",
                      border: "none",
                      color: "white",
                      borderRadius: 6,
                      padding: "8px 16px",
                      cursor: "pointer",
                    }}
                  >
                    Download Report
                  </button>
                )}
                <button
                  onClick={() => deleteDocument(r._id)}
                  style={{
                    background: "#d32f2f",
                    border: "none",
                    color: "white",
                    borderRadius: 6,
                    padding: "8px 16px",
                    cursor: "pointer",
                  }}
                >
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
