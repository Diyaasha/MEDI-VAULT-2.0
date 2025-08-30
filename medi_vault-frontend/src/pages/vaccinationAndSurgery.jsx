import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Syringe,
  Stethoscope,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

const STATUS_ICONS = {
  Complete: <CheckCircle style={{ color: "green" }} />,
  Completed: <CheckCircle style={{ color: "green" }} />,
  "Pending Second Dose": <Clock style={{ color: "orange" }} />,
  Scheduled: <Clock style={{ color: "orange" }} />,
  Default: <AlertCircle style={{ color: "gray" }} />,
};

const STATUS_VARIANTS = {
  Complete: "badge-default",
  Completed: "badge-default",
  "Pending Second Dose": "badge-secondary",
  Scheduled: "badge-secondary",
  Default: "badge-outline",
};

const getStatusIcon = (status) => {
  return STATUS_ICONS[status] || STATUS_ICONS.Default;
};

const getStatusVariant = (status) => {
  return STATUS_VARIANTS[status] || STATUS_VARIANTS.Default;
};

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

const VaccinationAndSurgery = () => {
  const [tab, setTab] = useState("vaccinations");
  const [vaccinations, setVaccinations] = useState([]);
  const [surgeries, setSurgeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Edit mode IDs
  const [editVaccId, setEditVaccId] = useState(null);
  const [editSurgId, setEditSurgId] = useState(null);

  // Search term state
  const [searchTerm, setSearchTerm] = useState("");

  // Vaccination form state
  const [vaccForm, setVaccForm] = useState({
    patientName: "",
    vaccine: "",
    date: "",
    nextDue: "",
    status: "",
    batchNumber: "",
    administrator: "",
    sideEffects: "",
    location: "",
    notes: "",
  });

  // Surgery form state
  const [surgForm, setSurgForm] = useState({
    patientName: "",
    procedure: "",
    date: "",
    surgeon: "",
    status: "",
    duration: "",
    anesthesia: "",
    complications: "",
    followUpDate: "",
    notes: "",
  });

  const getToken = () => {
    const user = localStorage.getItem("user");
    if (user) {
      return JSON.parse(user).token;
    }
    return null;
  };

  const fetchData = async () => {
    setLoading(true);
    setMessage(null);
    const token = getToken();
    const headers = { Authorization: `Bearer ${token}` };
    try {
      if (tab === "vaccinations") {
        const res = await axios.get(`${API_BASE}/api/vaccinations`, { headers });
        setVaccinations(res.data);
      } else {
        const res = await axios.get(`${API_BASE}/api/surgeries`, { headers });
        setSurgeries(res.data);
      }
    } catch {
      setMessage("Failed to load records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tab]);

  // Handlers for Vaccination form input change
  const handleVaccFormChange = (e) => {
    setVaccForm({ ...vaccForm, [e.target.name]: e.target.value });
  };

  // Handlers for Surgery form input change
  const handleSurgFormChange = (e) => {
    setSurgForm({ ...surgForm, [e.target.name]: e.target.value });
  };

  // Reset Vaccination form & edit mode
  const handleCancelEditVaccination = () => {
    setEditVaccId(null);
    setVaccForm({
      patientName: "",
      vaccine: "",
      date: "",
      nextDue: "",
      status: "",
      batchNumber: "",
      administrator: "",
      sideEffects: "",
      location: "",
      notes: "",
    });
  };

  // Reset Surgery form & edit mode
  const handleCancelEditSurgery = () => {
    setEditSurgId(null);
    setSurgForm({
      patientName: "",
      procedure: "",
      date: "",
      surgeon: "",
      status: "",
      duration: "",
      anesthesia: "",
      complications: "",
      followUpDate: "",
      notes: "",
    });
  };

  // Save vaccination (create or update)
  const handleSaveVaccination = async () => {
    const token = getToken();
    if (!token) {
      setMessage("You must be logged in.");
      return;
    }
    try {
      if (editVaccId) {
        await axios.put(`${API_BASE}/api/vaccinations/${editVaccId}`, vaccForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage("Vaccination record updated.");
      } else {
        await axios.post(`${API_BASE}/api/vaccinations`, vaccForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage("New vaccination record saved.");
      }
      handleCancelEditVaccination();
      fetchData();
    } catch {
      setMessage("Failed to save vaccination record.");
    }
  };

  // Save surgery (create or update)
  const handleSaveSurgery = async () => {
    const token = getToken();
    if (!token) {
      setMessage("You must be logged in.");
      return;
    }
    try {
      if (editSurgId) {
        await axios.put(`${API_BASE}/api/surgeries/${editSurgId}`, surgForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage("Surgery record updated.");
      } else {
        await axios.post(`${API_BASE}/api/surgeries`, surgForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage("New surgery record saved.");
      }
      handleCancelEditSurgery();
      fetchData();
    } catch {
      setMessage("Failed to save surgery record.");
    }
  };

  // Edit vaccination button clicked
  const handleEditVaccination = (v) => {
    setEditVaccId(v._id);
    setVaccForm({
      ...v,
      date: v.date ? v.date.slice(0, 10) : "",
      nextDue: v.nextDue ? v.nextDue.slice(0, 10) : "",
    });
    setTab("vaccinations");
    setMessage(null);
  };

  // Edit surgery button clicked
  const handleEditSurgery = (s) => {
    setEditSurgId(s._id);
    setSurgForm({
      ...s,
      date: s.date ? s.date.slice(0, 10) : "",
      followUpDate: s.followUpDate ? s.followUpDate.slice(0, 10) : "",
    });
    setTab("surgeries");
    setMessage(null);
  };

  // Delete vaccination
  const handleDeleteVaccination = async (id) => {
    const token = getToken();
    if (!token) {
      setMessage("You must be logged in.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this vaccination record?")) {
      return;
    }
    try {
      await axios.delete(`${API_BASE}/api/vaccinations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Vaccination record deleted.");
      fetchData();
    } catch {
      setMessage("Failed to delete vaccination record.");
    }
  };

  // Delete surgery
  const handleDeleteSurgery = async (id) => {
    const token = getToken();
    if (!token) {
      setMessage("You must be logged in.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this surgery record?")) {
      return;
    }
    try {
      await axios.delete(`${API_BASE}/api/surgeries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Surgery record deleted.");
      fetchData();
    } catch {
      setMessage("Failed to delete surgery record.");
    }
  };

  // Filtered records based on search term
  const filteredVaccinations = vaccinations.filter(
    (v) =>
      v.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vaccine.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredSurgeries = surgeries.filter(
    (s) =>
      s.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.procedure.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", padding: 20 }}>
      <div style={{ maxWidth: 960, margin: "auto" }}>
        <h1
          style={{ fontSize: "1.75rem", fontWeight: "bold", marginBottom: 20 }}
        >
          Vaccination and Surgery Management
        </h1>

        {/* Message */}
        {message && (
          <div
            style={{
              backgroundColor: "#fde2e1",
              color: "#b91c1c",
              padding: 10,
              marginBottom: 16,
              borderRadius: 6,
            }}
          >
            {message}
          </div>
        )}

        {/* Search Input */}
        <div style={{ marginBottom: 20 }}>
          <input
            type="text"
            placeholder="Search by patient name, procedure, or vaccine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", padding: 8, fontSize: 16 }}
          />
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            marginBottom: 20,
            borderBottom: "2px solid #e2e8f0",
          }}
        >
          <button
            onClick={() => setTab("vaccinations")}
            style={{
              flex: 1,
              padding: "10px 0",
              border: "none",
              borderBottom:
                tab === "vaccinations" ? "3px solid #2563eb" : "none",
              backgroundColor: "transparent",
              fontWeight: tab === "vaccinations" ? "bold" : "normal",
              cursor: "pointer",
            }}
          >
            <Syringe
              size={16}
              style={{ verticalAlign: "middle", marginRight: 6 }}
            />
            Vaccinations
          </button>
          <button
            onClick={() => setTab("surgeries")}
            style={{
              flex: 1,
              padding: "10px 0",
              border: "none",
              borderBottom: tab === "surgeries" ? "3px solid #2563eb" : "none",
              backgroundColor: "transparent",
              fontWeight: tab === "surgeries" ? "bold" : "normal",
              cursor: "pointer",
            }}
          >
            <Stethoscope
              size={16}
              style={{ verticalAlign: "middle", marginRight: 6 }}
            />
            Surgeries
          </button>
        </div>

        <div>
          {tab === "vaccinations" && (
            <>
              <h2 style={{ marginBottom: "1rem" }}>
                {editVaccId ? "Edit Vaccination Record" : "Add New Vaccination Record"}
              </h2>
              <div
                style={{
                  marginBottom: 30,
                  background: "white",
                  padding: 20,
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <label>
                  Patient Name:
                  <input
                    type="text"
                    name="patientName"
                    value={vaccForm.patientName}
                    onChange={handleVaccFormChange}
                    style={{ width: "100%", marginBottom: 8 }}
                  />
                </label>
                <label>
                  Vaccine:
                  <input
                    type="text"
                    name="vaccine"
                    value={vaccForm.vaccine}
                    onChange={handleVaccFormChange}
                    style={{ width: "100%", marginBottom: 8 }}
                  />
                </label>
                <label>
                  Date Administered:
                  <input
                    type="date"
                    name="date"
                    value={vaccForm.date}
                    onChange={handleVaccFormChange}
                    style={{ width: "100%", marginBottom: 8 }}
                  />
                </label>
                <label>
                  Next Due:
                  <input
                    type="date"
                    name="nextDue"
                    value={vaccForm.nextDue}
                    onChange={handleVaccFormChange}
                    style={{ width: "100%", marginBottom: 8 }}
                  />
                </label>
                <label>
                  Status:
                  <input
                    type="text"
                    name="status"
                    value={vaccForm.status}
                    onChange={handleVaccFormChange}
                    placeholder="Complete, Pending Second Dose, etc."
                    style={{ width: "100%", marginBottom: 8 }}
                  />
                </label>
                <label>
                  Batch Number:
                  <input
                    type="text"
                    name="batchNumber"
                    value={vaccForm.batchNumber}
                    onChange={handleVaccFormChange}
                    style={{ width: "100%", marginBottom: 8 }}
                  />
                </label>
                <label>
                  Administrator:
                  <input
                    type="text"
                    name="administrator"
                    value={vaccForm.administrator}
                    onChange={handleVaccFormChange}
                    style={{ width: "100%", marginBottom: 8 }}
                  />
                </label>
                <label>
                  Location:
                  <input
                    type="text"
                    name="location"
                    value={vaccForm.location}
                    onChange={handleVaccFormChange}
                    style={{ width: "100%", marginBottom: 8 }}
                  />
                </label>
                <label>
                  Side Effects:
                  <input
                    type="text"
                    name="sideEffects"
                    value={vaccForm.sideEffects}
                    onChange={handleVaccFormChange}
                    style={{ width: "100%", marginBottom: 8 }}
                  />
                </label>
                <label>
                  Notes:
                  <textarea
                    name="notes"
                    value={vaccForm.notes}
                    onChange={handleVaccFormChange}
                    style={{ width: "100%", marginBottom: 8 }}
                  />
                </label>
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={handleSaveVaccination}>
                    {editVaccId ? "Update Record" : "Save Record"}
                  </button>
                  {editVaccId && <button onClick={handleCancelEditVaccination}>Cancel</button>}
                </div>
              </div>

              {loading && <p>Loading vaccination records...</p>}
              {!loading &&
                filteredVaccinations.length > 0 ? (
                filteredVaccinations.map((v) => (
                  <div
                    key={v._id}
                    style={{
                      background: "white",
                      borderRadius: 6,
                      padding: 16,
                      marginBottom: 16,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <div style={{ fontWeight: "bold", fontSize: "1.125rem" }}>
                        {v.patientName}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {getStatusIcon(v.status)}
                        <span className={getStatusVariant(v.status)}>{v.status}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 14, color: "#4b5563" }}>
                      <p>
                        <strong>Vaccine:</strong> {v.vaccine}
                      </p>
                      <p>
                        <strong>Date Administered:</strong>{" "}
                        {new Date(v.date).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Next Due:</strong>{" "}
                        {v.nextDue ? new Date(v.nextDue).toLocaleDateString() : "N/A"}
                      </p>
                      <p>
                        <strong>Batch Number:</strong> {v.batchNumber}
                      </p>
                      <p>
                        <strong>Administrator:</strong> {v.administrator}
                      </p>
                      <p>
                        <strong>Location:</strong> {v.location}
                      </p>
                      <p>
                        <strong>Side Effects:</strong> {v.sideEffects}
                      </p>
                      <p>
                        <strong>Notes:</strong> {v.notes}
                      </p>
                      <div style={{ marginTop: 8 }}>
                        <button onClick={() => handleEditVaccination(v)}>Edit</button>{" "}
                        <button onClick={() => handleDeleteVaccination(v._id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No vaccination records found.</p>
              )}
            </>
          )}

          {tab === "surgeries" && (
            <>
              <h2 style={{ marginBottom: "1rem" }}>
                {editSurgId ? "Edit Surgery Record" : "Add New Surgery Record"}
              </h2>
              <div
                style={{
                  marginBottom: 30,
                  background: "white",
                  padding: 20,
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <label>
                  Patient Name:
                  <input
                    type="text"
                    name="patientName"
                    value={surgForm.patientName}
                    onChange={handleSurgFormChange}
                    style={{ width: "100%", marginBottom: 8 }}
                  />
                </label>
                <label>
                  Procedure:
                  <input
                    type="text"
                    name="procedure"
                    value={surgForm.procedure}
                    onChange={handleSurgFormChange}
                    style={{ width: "100%", marginBottom: 8 }}
                  />
                </label>
                <label>
                  Surgery Date:
                  <input
                    type="date"
                    name="date"
                    value={surgForm.date}
                    onChange={handleSurgFormChange}
                    style={{ width: "100%", marginBottom: 8 }}
                  />
                </label>
                <label>
                  Surgeon:
                  <input
                    type="text"
                    name="surgeon"
                    value={surgForm.surgeon}
                    onChange={handleSurgFormChange}
                    style={{ width: "100%", marginBottom: 8 }}
                  />
                </label>
                <label>
                  Status:
                  <input
                    type="text"
                    name="status"
                    value={surgForm.status}
                    onChange={handleSurgFormChange}
                    placeholder="Completed, Scheduled, etc."
                    style={{ width: "100%", marginBottom: 8 }}
                  />
                </label>
                <label>
                  Duration:
                  <input
                    type="text"
                    name="duration"
                    value={surgForm.duration}
                    onChange={handleSurgFormChange}
                    placeholder="e.g., 45 minutes"
                    style={{ width: "100%", marginBottom: 8 }}
                  />
                </label>
                <label>
                  Anesthesia:
                  <input
                    type="text"
                    name="anesthesia"
                    value={surgForm.anesthesia}
                    onChange={handleSurgFormChange}
                    placeholder="General, Local, Spinal"
                    style={{ width: "100%", marginBottom: 8 }}
                  />
                </label>
                <label>
                  Complications:
                  <input
                    type="text"
                    name="complications"
                    value={surgForm.complications}
                    onChange={handleSurgFormChange}
                    placeholder="None, or describe"
                    style={{ width: "100%", marginBottom: 8 }}
                  />
                </label>
                <label>
                  Follow-up Date:
                  <input
                    type="date"
                    name="followUpDate"
                    value={surgForm.followUpDate}
                    onChange={handleSurgFormChange}
                    style={{ width: "100%", marginBottom: 8 }}
                  />
                </label>
                <label>
                  Notes:
                  <textarea
                    name="notes"
                    value={surgForm.notes}
                    onChange={handleSurgFormChange}
                    style={{ width: "100%", marginBottom: 8 }}
                  />
                </label>
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={handleSaveSurgery}>
                    {editSurgId ? "Update Record" : "Save Record"}
                  </button>
                  {editSurgId && <button onClick={handleCancelEditSurgery}>Cancel</button>}
                </div>
              </div>

              {loading && <p>Loading surgery records...</p>}
              {!loading &&
                filteredSurgeries.length > 0 ? (
                filteredSurgeries.map((s) => (
                  <div
                    key={s._id}
                    style={{
                      background: "white",
                      borderRadius: 6,
                      padding: 16,
                      marginBottom: 16,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <div style={{ fontWeight: "bold", fontSize: "1.125rem" }}>
                        {s.patientName}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {getStatusIcon(s.status)}
                        <span className={getStatusVariant(s.status)}>{s.status}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 14, color: "#4b5563" }}>
                      <p>
                        <strong>Procedure:</strong> {s.procedure}
                      </p>
                      <p>
                        <strong>Surgery Date:</strong>{" "}
                        {new Date(s.date).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Surgeon:</strong> {s.surgeon}
                      </p>
                      <p>
                        <strong>Duration:</strong> {s.duration}
                      </p>
                      <p>
                        <strong>Anesthesia:</strong> {s.anesthesia}
                      </p>
                      <p>
                        <strong>Complications:</strong> {s.complications}
                      </p>
                      <p>
                        <strong>Follow-up Date:</strong>{" "}
                        {s.followUpDate ? new Date(s.followUpDate).toLocaleDateString() : "N/A"}
                      </p>
                      <p>
                        <strong>Notes:</strong> {s.notes}
                      </p>
                      <div style={{ marginTop: 8 }}>
                        <button onClick={() => handleEditSurgery(s)}>Edit</button>{" "}
                        <button onClick={() => handleDeleteSurgery(s._id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No surgery records found.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VaccinationAndSurgery;
