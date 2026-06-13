import React, { useState, useEffect } from "react";
import axios from "axios";
import usePageTitle from '../hooks/usePageTitle';
import "./vaccinationAndSurgery.css";
import {
  Syringe,
  Stethoscope,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
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

const getStatusIcon = (status) => STATUS_ICONS[status] || STATUS_ICONS.Default;
const getStatusVariant = (status) =>
  STATUS_VARIANTS[status] || STATUS_VARIANTS.Default;

const API_BASE = process.env.REACT_APP_API_URL || "https://medi-vault-zsg1.onrender.com";

const VaccinationAndSurgery = () => {
  usePageTitle('Vaccinations & Surgery');
  const [tab, setTab] = useState("vaccinations");
  const [vaccinations, setVaccinations] = useState([]);
  const [surgeries, setSurgeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [editVaccId, setEditVaccId] = useState(null);
  const [editSurgId, setEditSurgId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Only required fields for vaccination form
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
    return user ? JSON.parse(user).token : null;
  };

  const fetchData = async () => {
    setLoading(true);
    setMessage(null);
    const token = getToken();
    const headers = { Authorization: `Bearer ${token}` };
    try {
      if (tab === "vaccinations") {
        const res = await axios.get(`${API_BASE}/api/vaccinations`, {
          headers,
        });
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

  const handleVaccFormChange = (e) =>
    setVaccForm({ ...vaccForm, [e.target.name]: e.target.value });

  const handleSurgFormChange = (e) =>
    setSurgForm({ ...surgForm, [e.target.name]: e.target.value });

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

  const handleSaveVaccination = async () => {
    const token = getToken();
    if (!token) return setMessage("You must be logged in.");
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

  const handleSaveSurgery = async () => {
    const token = getToken();
    if (!token) return setMessage("You must be logged in.");
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

  const handleEditVaccination = (v) => {
    setEditVaccId(v._id);
    setVaccForm({
      ...v,
      date: v.date?.slice(0, 10) || "",
      nextDue: v.nextDue?.slice(0, 10) || "",
    });
    setTab("vaccinations");
    setMessage(null);
  };

  const handleEditSurgery = (s) => {
    setEditSurgId(s._id);
    setSurgForm({
      ...s,
      date: s.date?.slice(0, 10) || "",
      followUpDate: s.followUpDate?.slice(0, 10) || "",
    });
    setTab("surgeries");
    setMessage(null);
  };

  const handleDeleteVaccination = async (id) => {
    const token = getToken();
    if (!token) return setMessage("You must be logged in.");
    if (!window.confirm("Are you sure you want to delete this vaccination record?"))
      return;
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

  const handleDeleteSurgery = async (id) => {
    const token = getToken();
    if (!token) return setMessage("You must be logged in.");
    if (!window.confirm("Are you sure you want to delete this surgery record?"))
      return;
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
    <div className="vaccination-surgery-container">
      <h1>Vaccination and Surgery Management</h1>

      {message && <div className="error-message">{message}</div>}

      <input
        className="search-input"
        type="text"
        placeholder="Search by patient name, procedure, or vaccine..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="tab-buttons">
        <button
          className={tab === "vaccinations" ? "active" : ""}
          onClick={() => setTab("vaccinations")}
        >
          <Syringe size={16} /> Vaccinations
        </button>
        <button
          className={tab === "surgeries" ? "active" : ""}
          onClick={() => setTab("surgeries")}
        >
          <Stethoscope size={16} /> Surgeries
        </button>
      </div>

      {/* ✅ Vaccination Tab */}
      {tab === "vaccinations" && (
        <>
          <h2>{editVaccId ? "Edit Vaccination Record" : "Add New Vaccination Record"}</h2>
          <div className="form-card">
            <div className="form-grid">
              <div>
                <label>Patient Name</label>
                <input
                  type="text"
                  name="patientName"
                  value={vaccForm.patientName}
                  onChange={handleVaccFormChange}
                  placeholder="Select or search patient..."
                />
              </div>
              <div>
                <label>Vaccine Type</label>
                <input
                  type="text"
                  name="vaccine"
                  value={vaccForm.vaccine}
                  onChange={handleVaccFormChange}
                  placeholder="COVID-19, Flu, Hepatitis..."
                />
              </div>
              <div>
                <label>Date Administered</label>
                <input
                  type="date"
                  name="date"
                  value={vaccForm.date}
                  onChange={handleVaccFormChange}
                />
              </div>
              <div>
                <label>Next Due Date</label>
                <input
                  type="date"
                  name="nextDue"
                  value={vaccForm.nextDue}
                  onChange={handleVaccFormChange}
                />
              </div>
              <div>
                <label>Status</label>
                <input
                  type="text"
                  name="status"
                  value={vaccForm.status}
                  onChange={handleVaccFormChange}
                  placeholder="Completed, Scheduled..."
                />
              </div>
              <div>
                <label>Batch Number</label>
                <input
                  type="text"
                  name="batchNumber"
                  value={vaccForm.batchNumber}
                  onChange={handleVaccFormChange}
                  placeholder="Vaccine batch number..."
                />
              </div>
              <div>
                <label>Administrator</label>
                <input
                  type="text"
                  name="administrator"
                  value={vaccForm.administrator}
                  onChange={handleVaccFormChange}
                  placeholder="Healthcare provider..."
                />
              </div>
              <div>
                <label>Injection Site</label>
                <input
                  type="text"
                  name="location"
                  value={vaccForm.location}
                  onChange={handleVaccFormChange}
                  placeholder="Left arm, Right arm..."
                />
              </div>
            </div>

            <div>
              <label>Side Effects</label>
              <input
                type="text"
                name="sideEffects"
                value={vaccForm.sideEffects}
                onChange={handleVaccFormChange}
                placeholder="Fever, pain, etc."
              />
            </div>

            <div>
              <label>Notes</label>
              <textarea
                name="notes"
                value={vaccForm.notes}
                onChange={handleVaccFormChange}
                placeholder="Any additional notes..."
              />
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button className="button button-primary" onClick={handleSaveVaccination}>
                {editVaccId ? "Update Record" : "Save Record"}
              </button>
            </div>
          </div>

          {loading && <p>Loading vaccination records...</p>}
          {!loading &&
            (filteredVaccinations.length > 0 ? (
              filteredVaccinations.map((v) => (
                <div className="record-card" key={v._id}>
                  <h3>{v.patientName}</h3>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      {getStatusIcon(v.status)}{" "}
                      <span className={getStatusVariant(v.status)}>{v.status}</span>
                    </div>
                    <div className="status-actions">
                      <button className="button-edit" onClick={() => handleEditVaccination(v)}>
                        <Edit size={14} /> Edit
                      </button>
                      <button className="button-delete" onClick={() => handleDeleteVaccination(v._id)}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>

                  <div className="record-details">
                    <p><strong>Vaccine:</strong> {v.vaccine}</p>
                    <p><strong>Date Administered:</strong> {new Date(v.date).toLocaleDateString()}</p>
                    <p><strong>Next Due:</strong> {v.nextDue ? new Date(v.nextDue).toLocaleDateString() : "N/A"}</p>
                    <p><strong>Status:</strong> {v.status}</p>
                    <p><strong>Batch Number:</strong> {v.batchNumber}</p>
                    <p><strong>Administrator:</strong> {v.administrator}</p>
                    <p><strong>Location:</strong> {v.location}</p>
                    <p><strong>Side Effects:</strong> {v.sideEffects}</p>
                    <p><strong>Notes:</strong> {v.notes}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No vaccination records found.</p>
            ))}
        </>
      )}

      {/* Surgery Tab (kept same) */}
      {tab === "surgeries" && (
        <>
          <h2>{editSurgId ? "Edit Surgery Record" : "Add New Surgery Record"}</h2>
          <div className="form-card">
            <div className="form-grid">
              <div>
                <label>Patient Name</label>
                <input
                  type="text"
                  name="patientName"
                  value={surgForm.patientName}
                  onChange={handleSurgFormChange}
                  placeholder="Select or search patient..."
                />
              </div>
              <div>
                <label>Procedure</label>
                <input
                  type="text"
                  name="procedure"
                  value={surgForm.procedure}
                  onChange={handleSurgFormChange}
                  placeholder="Appendectomy, Knee Replacement..."
                />
              </div>
              <div>
                <label>Surgery Date</label>
                <input
                  type="date"
                  name="date"
                  value={surgForm.date}
                  onChange={handleSurgFormChange}
                />
              </div>
              <div>
                <label>Follow-up Date</label>
                <input
                  type="date"
                  name="followUpDate"
                  value={surgForm.followUpDate}
                  onChange={handleSurgFormChange}
                />
              </div>
              <div>
                <label>Status</label>
                <input
                  type="text"
                  name="status"
                  value={surgForm.status}
                  onChange={handleSurgFormChange}
                />
              </div>
              <div>
                <label>Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={surgForm.duration}
                  onChange={handleSurgFormChange}
                />
              </div>
              <div>
                <label>Anesthesia</label>
                <input
                  type="text"
                  name="anesthesia"
                  value={surgForm.anesthesia}
                  onChange={handleSurgFormChange}
                />
              </div>
              <div>
                <label>Complications</label>
                <input
                  type="text"
                  name="complications"
                  value={surgForm.complications}
                  onChange={handleSurgFormChange}
                />
              </div>
              <div>
                <label>Surgeon</label>
                <input
                  type="text"
                  name="surgeon"
                  value={surgForm.surgeon}
                  onChange={handleSurgFormChange}
                  placeholder="Doctor's name..."
                />
              </div>
            </div>

            <div>
              <label>Notes</label>
              <textarea
                name="notes"
                value={surgForm.notes}
                onChange={handleSurgFormChange}
                placeholder="Post-surgery notes or patient recovery info..."
              />
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button className="button button-primary" onClick={handleSaveSurgery}>
                {editSurgId ? "Update Record" : "Save Record"}
              </button>
            </div>
          </div>

          {loading && <p>Loading surgery records...</p>}
          {!loading &&
            (filteredSurgeries.length > 0 ? (
              filteredSurgeries.map((s) => (
                <div className="record-card" key={s._id}>
                  <h3>{s.patientName}</h3>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      {getStatusIcon(s.status)}{" "}
                      <span className={getStatusVariant(s.status)}>{s.status}</span>
                    </div>
                    <div className="status-actions">
                      <button className="button-edit" onClick={() => handleEditSurgery(s)}>
                        <Edit size={14} /> Edit
                      </button>
                      <button className="button-delete" onClick={() => handleDeleteSurgery(s._id)}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>

                  <div className="record-details">
                    <p><strong>Procedure:</strong> {s.procedure}</p>
                    <p><strong>Surgery Date:</strong> {new Date(s.date).toLocaleDateString()}</p>
                    <p><strong>Surgeon:</strong> {s.surgeon}</p>
                    <p><strong>Duration:</strong> {s.duration}</p>
                    <p><strong>Anesthesia:</strong> {s.anesthesia}</p>
                    <p><strong>Complications:</strong> {s.complications}</p>
                    <p><strong>Follow-up Date:</strong> {s.followUpDate ? new Date(s.followUpDate).toLocaleDateString() : "N/A"}</p>
                    <p><strong>Notes:</strong> {s.notes}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No surgery records found.</p>
            ))}
        </>
      )}
    </div>
  );
};

export default VaccinationAndSurgery;
