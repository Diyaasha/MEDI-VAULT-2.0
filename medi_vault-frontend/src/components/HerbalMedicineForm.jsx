import React, { useState, useEffect } from "react";

export default function HerbalMedicineForm({ medicine, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    botanicalName: "",
    formulation: "",
    dosageForm: "",
    usage: "",
    stockQuantity: 0,
    expiryDate: "",
    supplier: "",
    notes: "",
  });
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";
  const token = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")).token
    : null;

  useEffect(() => {
    if (medicine) {
      setFormData({
        name: medicine.name || "",
        botanicalName: medicine.botanicalName || "",
        formulation: medicine.formulation || "",
        dosageForm: medicine.dosageForm || "",
        usage: medicine.usage || "",
        stockQuantity: medicine.stockQuantity || 0,
        expiryDate: medicine.expiryDate ? medicine.expiryDate.slice(0, 10) : "",
        supplier: medicine.supplier || "",
        notes: medicine.notes || "",
      });
    }
  }, [medicine]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "stockQuantity" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Please enter the herbal medicine name.");
      return;
    }
    if (!formData.botanicalName.trim()) {
      alert("Please enter the botanical (scientific) name.");
      return;
    }
    if (formData.stockQuantity < 0) {
      alert("Stock quantity cannot be negative.");
      return;
    }
    if (!token) {
      alert("Please login to continue.");
      return;
    }

    try {
      const url = medicine
        ? `${API_BASE}/api/herbal-medicines/${medicine._id}`
        : `${API_BASE}/api/herbal-medicines`;
      const method = medicine ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to save herbal medicine");
      }

      // After success, optionally parse response data if needed:
      // const savedMedicine = await res.json();

      alert(`Herbal medicine ${medicine ? "updated" : "created"} successfully.`);
      onCancel(); // Close form after save
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "auto", padding: 16 }}>
      <h2>{medicine ? "Edit" : "Add"} Herbal Medicine</h2>

      <label title="Common or trade name of the herb">
        Name:<br />
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="e.g. Tulsi"
          style={{ width: "100%", marginBottom: 12 }}
        />
      </label>

      <label title="Scientific Latin name, e.g. Ocimum sanctum">
        Botanical Name:<br />
        <input
          name="botanicalName"
          value={formData.botanicalName}
          onChange={handleChange}
          required
          placeholder="e.g. Ocimum sanctum"
          style={{ width: "100%", marginBottom: 12 }}
        />
      </label>

      <label title="Formulation type like powder, decoction, capsule">
        Formulation:<br />
        <input
          name="formulation"
          value={formData.formulation}
          onChange={handleChange}
          placeholder="e.g. powder, tablet"
          style={{ width: "100%", marginBottom: 12 }}
        />
      </label>

      <label title="How the medicine is administered">
        Dosage Form:<br />
        <input
          name="dosageForm"
          value={formData.dosageForm}
          onChange={handleChange}
          placeholder="e.g. capsule, syrup"
          style={{ width: "100%", marginBottom: 12 }}
        />
      </label>

      <label title="Therapeutic use or instructions">
        Usage:<br />
        <textarea
          name="usage"
          value={formData.usage}
          onChange={handleChange}
          rows={3}
          placeholder="Description or traditional uses"
          style={{ width: "100%", marginBottom: 12 }}
        />
      </label>

      <label title="Available quantity in stock (units)">
        Stock Quantity:<br />
        <input
          type="number"
          name="stockQuantity"
          value={formData.stockQuantity}
          onChange={handleChange}
          min={0}
          style={{ width: 100, marginBottom: 12 }}
        />
      </label>

      <label title="Expiry date of the stock/batch">
        Expiry Date:<br />
        <input
          type="date"
          name="expiryDate"
          value={formData.expiryDate}
          onChange={handleChange}
          style={{ width: "100%", marginBottom: 12 }}
        />
      </label>

      <label title="Supplier or provider of the herbal medicine">
        Supplier:<br />
        <input
          name="supplier"
          value={formData.supplier}
          onChange={handleChange}
          placeholder="Supplier name"
          style={{ width: "100%", marginBottom: 12 }}
        />
      </label>

      <label title="Additional notes or special instructions">
        Notes:<br />
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          style={{ width: "100%", marginBottom: 12 }}
        />
      </label>

      <button type="submit" style={{ marginRight: 12 }}>
        {medicine ? "Update" : "Add"} Medicine
      </button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
}
