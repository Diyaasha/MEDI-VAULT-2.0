import React, { useState } from "react";
import HerbalMedicineList from "./HerbalMedicineList";
import HerbalMedicineForm from "./HerbalMedicineForm";
import "./HerbalMedicineTab.css"; // ⬅️ add css file

const API_BASE = process.env.REACT_APP_API_URL || "https://medi-vault-zsg1.onrender.com";

export default function HerbalMedicinesTab() {
  const [showForm, setShowForm] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const token = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")).token
    : null;
  const [listKey, setListKey] = useState(0);

  const handleAddNew = () => {
    setSelectedMedicine(null);
    setShowForm(true);
  };

  const handleEdit = (medicine) => {
    setSelectedMedicine(medicine);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedMedicine(null);
  };

  const reloadList = () => {
    setListKey((prev) => prev + 1);
  };

  const handleSave = async (formData) => {
    if (!token) return alert("Please login to continue.");
    setShowForm(false);
    try {
      const url = selectedMedicine
        ? `${API_BASE}/api/herbal-medicines/${selectedMedicine._id}`
        : `${API_BASE}/api/herbal-medicines`;
      const method = selectedMedicine ? "PUT" : "POST";

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
        let message = "Save failed";
        try {
          const jsonErr = JSON.parse(text);
          message = jsonErr.message || message;
        } catch {
          message = text || message;
        }
        throw new Error(message);
      }

      reloadList();
      setSelectedMedicine(null);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h2>Herbal Medicines</h2>

      {!showForm && (
        <button className="add-btn" onClick={handleAddNew}>
          + Add New Herbal Medicine
        </button>
      )}

      {showForm ? (
        <HerbalMedicineForm
          medicine={selectedMedicine}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <HerbalMedicineList
          key={listKey}
          onEdit={handleEdit}
          reloadList={reloadList}
        />
      )}
    </div>
  );
}
