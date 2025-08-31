import React, { useEffect, useState, useCallback } from "react";


const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

export default function HerbalMedicineList({ onEdit, reloadList }) {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).token : null;

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
  },[token]);

  useEffect(() => {
    fetchMedicines();
    // Optionally add fetchMedicines to dependency array if wrapped in useCallback
    // eslint-disable-next-line
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
      // Choose only one reload strategy:
      await fetchMedicines();
      // reloadList && reloadList(); // Optionally call the parent reload if you use this pattern elsewhere
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading herbal medicines...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!medicines.length) return <p>No herbal medicines found.</p>;

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {medicines.map((med) => (
        <li
          key={med._id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 16,
            marginBottom: 12,
          }}
        >
          <strong>{med.name}</strong> {med.botanicalName && `(${med.botanicalName})`}<br />
          Formulation: {med.formulation} <br />
          Dosage Form: {med.dosageForm} <br />
          Stock: {med.stockQuantity} <br />
          Expiry: {med.expiryDate ? new Date(med.expiryDate).toLocaleDateString() : "N/A"} <br />
          Supplier: {med.supplier}<br />
          <button onClick={() => onEdit(med)}>Edit</button>{" "}
          <button onClick={() => handleDelete(med._id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
