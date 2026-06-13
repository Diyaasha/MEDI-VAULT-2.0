import React, { useEffect, useState, useCallback } from "react";
import "./HerbalMedicineList.css";

const API_BASE = process.env.REACT_APP_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3000' : 'https://medi-vault-zsg1.onrender.com');

export default function HerbalMedicineList({ onEdit, reloadList }) {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")).token
    : null;

  const fetchMedicines = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/herbal-medicines`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to load herbal medicines");
      }
      const data = await res.json();
      setMedicines(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medicine?")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/herbal-medicines/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete medicine");
      await fetchMedicines();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="loading">Loading herbal medicines...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!medicines.length) return <p className="empty">No herbal medicines found.</p>;

  return (
    <div className="medicine-list">
      {medicines.map((med) => (
        <div key={med._id} className="medicine-card">
          <h3 className="medicine-title">
            {med.name}{" "}
            {med.botanicalName && (
              <span className="botanical">({med.botanicalName})</span>
            )}
          </h3>
          <p><strong>Formulation:</strong> {med.formulation}</p>
          <p><strong>Dosage Form:</strong> {med.dosageForm}</p>
          <p><strong>Stock:</strong> {med.stockQuantity}</p>
          <p>
            <strong>Expiry:</strong>{" "}
            {med.expiryDate
              ? new Date(med.expiryDate).toLocaleDateString()
              : "N/A"}
          </p>
          <p><strong>Supplier:</strong> {med.supplier}</p>
          <div className="card-actions">
            <button className="btn edit" onClick={() => onEdit(med)}>Edit</button>
            <button className="btn delete" onClick={() => handleDelete(med._id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
