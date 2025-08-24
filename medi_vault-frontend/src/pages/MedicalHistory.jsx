import React, { useState, useEffect, useRef } from "react";
import {
  FiFileText, FiFilter, FiSearch, FiDownload, FiUpload
} from "react-icons/fi";
import "./MedicalHistory.css";
// ... import any custom Button/Card/Badge/Input/Tabs components you use here ...


const MedicalHistory = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [recentRecords, setRecentRecords] = useState([]);
  const [vitalStats, setVitalStats] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("general");
  const fileInputRef = useRef(null);

  const storedUser = localStorage.getItem("user");
  const token = storedUser ? JSON.parse(storedUser).token : null;
  const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:3000";
  
  // Fetch user profile for vitals
  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const profile = await res.json();
        setVitalStats([
          { label: "Blood Pressure", value: profile.bloodPressure || "N/A", status: "normal", trend: "stable" },
          { label: "Heart Rate", value: profile.heartRate || "N/A", status: "normal", trend: "stable" },
          { label: "Temperature", value: profile.temperature || "N/A", status: "normal", trend: "stable" },
          { label: "Weight", value: profile.weight || "N/A", status: "normal", trend: "stable" },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch profile vitals", error);
    }
  };


  // Fetch records, reminders, documents
  const fetchMedicalData = async () => {
    try {
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      const [recordsRes, remindersRes, docsRes] = await Promise.all([
        fetch(`${baseUrl}/api/medical-history`, { headers }),
        fetch(`${baseUrl}/api/medicine-reminders`, { headers }),
        fetch(`${baseUrl}/api/medical-history`, { headers }),
      ]);
      if (recordsRes.ok) setRecentRecords(await recordsRes.json());
      if (remindersRes.ok) setUpcomingReminders(await remindersRes.json());
      if (docsRes.ok) setDocuments(await docsRes.json());
    } catch (error) {
      console.error("Error loading medical data", error);
    }
  };


  useEffect(() => {
    fetchUserProfile();
    fetchMedicalData();
  }, [token]);


  // File upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !token) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", uploadCategory);
    formData.append("title", file.name);
    formData.append("date", new Date().toISOString());
    setUploading(true);
    try {
      const res = await fetch(`${baseUrl}/api/medical-history/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        alert("Upload successful");
        fetchMedicalData();
      } else {
        alert("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading document", error);
      alert("Upload error");
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };
  const triggerUpload = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };


  // Download document
  async function downloadDocument(docId) {
    try {
      if (!token) {
        alert("Please login to download documents.");
        return;
      }
      const res = await fetch(`${baseUrl}/api/medical-history/download-url/${docId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to get download URL");
      const data = await res.json();
      window.open(data.url, "_blank");
    } catch (err) {
      console.error(err);
      alert("Failed to download document.");
    }
  }


  // UI Return
  return (
    <div className="medicine-reminder-page">
      <div className="medicine-reminder-container">
        {/* Page Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: 48, color: "#004aad" }}>
            <FiFileText />
          </div>
          <h1>Medical History Management System</h1>
          <p>
            Comprehensive tracking and management of your complete medical history, health records, and vital information in one secure location.
          </p>
        </div>
        {/* Search and Filter Section */}
        <div className="flex gap-4 mb-4 flex-wrap">
          <div style={{ position: "relative", flexGrow: 1 }}>
            <FiSearch style={{ position: "absolute", top: "50%", left: 8, transform: "translateY(-50%)", color: "#888" }} />
            <input
              placeholder="Search medical records, medications, doctors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              style={{ paddingLeft: 32, width: "100%", borderRadius: 6 }}
            />
          </div>
          <div>
            <FiFilter style={{ verticalAlign: "middle", marginRight: 6 }} />
            <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)} style={{ height: 32 }}>
              <option value="all">All Records</option>
              <option value="symptoms">Symptoms</option>
              <option value="vitals">Vitals</option>
              <option value="medication">Medications</option>
              <option value="consultation">Consultation</option>
              <option value="general">General</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <button className="mr-2" style={{ border: "1px solid #fff", background: "#222e", padding: "0.5em 1em", borderRadius: 4, color: "#fff", marginRight: 10 }}>
              <FiDownload style={{ verticalAlign: "middle", marginRight: 6 }} />
              Export
            </button>
            <button onClick={triggerUpload} disabled={uploading} style={{ border: "1px solid #fff", background: "#222e", padding: "0.5em 1em", borderRadius: 4, color: "#fff" }}>
              <FiUpload style={{ verticalAlign: "middle", marginRight: 6 }} />
              {uploading ? "Uploading..." : "Upload Document"}
            </button>
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
          accept=".pdf,image/*"
        />
        {/* Category Selector */}
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Document Category:{" "}
            <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)}>
              <option value="symptoms">Symptoms</option>
              <option value="vitals">Vitals</option>
              <option value="medication">Medications</option>
              <option value="consultation">Consultation</option>
              <option value="general">General</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>
        {/* ---- MEDICAL HISTORY SECTION: 6 HORIZONTAL BOXES ---- */}
       <div>
  <h3 style={{ color: "#fff", fontWeight: 700, marginBottom: 18 }}>Medical History</h3>
  <div className="mh-grid-3x2">
    <div className="mh-card">
      <div className="mh-title">Hospitalizations</div>
      <ul>
        <li>Admission & Discharge dates</li>
        <li>Reason (illness, surgery, accident, etc.)</li>
        <li>Hospital/Clinic name</li>
      </ul>
    </div>
    <div className="mh-card">
      <div className="mh-title">Surgeries / Procedures</div>
      <ul>
        <li>Type of surgery</li>
        <li>Date of surgery</li>
        <li>Hospital & Surgeon’s name</li>
      </ul>
    </div>
    <div className="mh-card">
      <div className="mh-title">Major Illnesses / Conditions</div>
      <ul>
        <li>Infectious/Chronic diseases</li>
        <li>Mental health treatments</li>
      </ul>
    </div>
    <div className="mh-card">
      <div className="mh-title">Injuries / Accidents</div>
      <ul>
        <li>Fractures, burns, etc.</li>
        <li>Treatment received</li>
      </ul>
    </div>
    <div className="mh-card">
      <div className="mh-title">Lab & Diagnostic Reports</div>
      <ul>
        <li>Blood tests, X-rays, MRI, CT, ECG</li>
        <li>Date of test</li>
        <li>Report upload (PDF/Image)</li>
      </ul>
    </div>
    <div className="mh-card">
      <div className="mh-title">Prescriptions & Treatment Records</div>
      <ul>
        <li>Past medications prescribed</li>
        <li>Duration of treatment</li>
        <li>Doctor’s details</li>
      </ul>
    </div>
  </div>
</div>

        {/* ---- END MEDICAL HISTORY SECTION ---- */}
        {/* Other content below ... */}
      </div>
    </div>
  );
};

export default MedicalHistory;
