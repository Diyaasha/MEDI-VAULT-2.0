import React, { useState, useEffect, useRef } from "react";
import {
  FiFileText,
  FiBell,
  FiClock,
  FiFilter,
  FiSearch,
  FiDownload,
  FiShare,
  FiUpload,
} from "react-icons/fi";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Input from "../components/ui/Input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/Tabs";

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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  // downloadDocument declared once here
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

        {/* Search and Filter */}
        <div className="flex gap-4 mb-4 flex-wrap">
          <div style={{ position: "relative", flexGrow: 1 }}>
            <FiSearch style={{ position: "absolute", top: "50%", left: 8, transform: "translateY(-50%)", color: "#888" }} />
            <Input
              placeholder="Search medical records, medications, doctors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
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
            <Button variant="outline" className="mr-2">
              <FiDownload style={{ verticalAlign: "middle", marginRight: 6 }} />
              Export
            </Button>
            <Button variant="outline" onClick={triggerUpload} disabled={uploading}>
              <FiUpload style={{ verticalAlign: "middle", marginRight: 6 }} />
              {uploading ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        </div>

        {/* Hidden file input for upload */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
          accept=".pdf,image/*"
        />

        {/* Category Selector for upload */}
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

        {/* Tabs */}
        <Tabs>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
            <TabsTrigger value="overview" activeTab={activeTab} onClick={setActiveTab}>Overview</TabsTrigger>
            <TabsTrigger value="records" activeTab={activeTab} onClick={setActiveTab}>Records</TabsTrigger>
            <TabsTrigger value="vitals" activeTab={activeTab} onClick={setActiveTab}>Vitals</TabsTrigger>
            <TabsTrigger value="medications" activeTab={activeTab} onClick={setActiveTab}>Medications</TabsTrigger>
            <TabsTrigger value="providers" activeTab={activeTab} onClick={setActiveTab}>Providers</TabsTrigger>
            <TabsTrigger value="documents" activeTab={activeTab} onClick={setActiveTab}>Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" activeTab={activeTab}>
            <h3>Vital Stats</h3>
            <div className="grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "16px", marginBottom: "1rem" }}>
              {vitalStats.map((stat, idx) => (
                <Card key={idx} className={`p-4 ${stat.status === "normal" ? "border-green-400" : "border-red-400"}`}>
                  <h4>{stat.label}</h4>
                  <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{stat.value}</p>
                  <p>Trend: {stat.trend === "stable" ? "→" : stat.trend === "up" ? "↗" : "↘"} {stat.trend}</p>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="records" activeTab={activeTab}>
            <h3>Recent Activity</h3>
            <div>
              {recentRecords.length === 0 ? (
                <p>No recent medical records found.</p>
              ) : (
                recentRecords.map((rec) => (
                  <Card key={rec._id} className="mb-4 p-4">
                    <strong>{rec.title}</strong>
                    <div>{rec.doctor} • {new Date(rec.date).toLocaleDateString()}</div>
                    <Badge variant="outline">{rec.category}</Badge>{" "}
                    <Badge variant="secondary">{rec.status || "Unknown"}</Badge>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="vitals" activeTab={activeTab}>
            <h3>Vitals data goes here</h3>
          </TabsContent>
          <TabsContent value="medications" activeTab={activeTab}>
            <h3>Medications data goes here</h3>
          </TabsContent>
          <TabsContent value="providers" activeTab={activeTab}>
            <h3>Providers data goes here</h3>
          </TabsContent>

          <TabsContent value="documents" activeTab={activeTab}>
            <h3>Uploaded Documents</h3>
            {documents.length === 0 ? (
              <p>No documents found.</p>
            ) : (
              documents.map((doc) => (
                <Card key={doc._id} className="mb-4 p-4 flex justify-between items-center">
                  <div>
                    <strong>{doc.title || doc.originalFileName}</strong><br />
                    <small>{new Date(doc.date).toLocaleDateString()}</small>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => downloadDocument(doc._id)}>
                    <FiDownload style={{ marginRight: 6 }} />
                    Download
                  </Button>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MedicalHistory;
