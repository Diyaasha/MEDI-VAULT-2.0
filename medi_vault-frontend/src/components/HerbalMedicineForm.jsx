import React, { useState, useEffect } from "react";
import "./HerbalMedicineForm.css";

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

  const API_BASE = process.env.REACT_APP_API_URL || "https://medi-vault-zsg1.onrender.com";
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

      alert(`Herbal medicine ${medicine ? "updated" : "created"} successfully.`);
      onCancel();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="herbal-form-container">
      <form className="herbal-form" onSubmit={handleSubmit}>
        <h2>{medicine ? "Edit" : "Add"} Herbal Medicine</h2>

        <label>
          Name:
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g. Tulsi"
          />
        </label>

        <label>
          Botanical Name:
          <input
            name="botanicalName"
            value={formData.botanicalName}
            onChange={handleChange}
            required
            placeholder="e.g. Ocimum sanctum"
          />
        </label>

        <label>
          Formulation:
          <input
            name="formulation"
            value={formData.formulation}
            onChange={handleChange}
            placeholder="e.g. powder, tablet"
          />
        </label>

        <label>
          Dosage Form:
          <input
            name="dosageForm"
            value={formData.dosageForm}
            onChange={handleChange}
            placeholder="e.g. capsule, syrup"
          />
        </label>

        <label>
          Usage:
          <textarea
            name="usage"
            value={formData.usage}
            onChange={handleChange}
            rows={3}
            placeholder="Description or traditional uses"
          />
        </label>

        <div className="form-row">
          <label>
            Stock Quantity:
            <input
              type="number"
              name="stockQuantity"
              value={formData.stockQuantity}
              onChange={handleChange}
              min={0}
            />
          </label>

          <label>
            Expiry Date:
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
            />
          </label>
        </div>

        <label>
          Supplier:
          <input
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            placeholder="Supplier name"
          />
        </label>

        <label>
          Notes:
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
          />
        </label>

        <div className="form-buttons">
          <button type="submit" className="btn-primary">
            {medicine ? "Update" : "Add"} Medicine
          </button>
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
