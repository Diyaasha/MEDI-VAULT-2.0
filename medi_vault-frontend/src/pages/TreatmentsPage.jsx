import React, { useState, useEffect } from "react";
import DoshaAssessmentPage from "./DoshaAssessmentPage";
import TreatmentList from "../components/TreatmentList";
import TreatmentForm from "../components/TreatmentForm";
import TreatmentPlansTab from "../components/TreatmentPlansTab";
import HerbalMedicinesTab from "../components/HerbalMedicinesTab";
import WellnessTrackingTab from "../components/WellnessTrackingTab";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

function StatCard({ label, value }) {
  return (
    <div style={{ flex: "1 1 150px", backgroundColor: "#1976d2", color: "white", borderRadius: 8, padding: 16, margin: 8, boxShadow: "0 2px 6px rgba(0,0,0,0.15)", textAlign: "center" }}>
      <div style={{ fontSize: 24, fontWeight: "bold" }}>{value}</div>
      <div>{label}</div>
    </div>
  );
}

export default function TreatmentsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [treatmentPlans, setTreatmentPlans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).token : null;

  useEffect(() => {
    fetchTreatmentPlans();
  }, []);

  const fetchTreatmentPlans = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/treatment-plans`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load treatment plans");
      const data = await res.json();
      setTreatmentPlans(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setSelectedTreatment(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedTreatment(null);
  };

  const handleSave = async (formData) => {
  if (!token) return alert("Please login to continue.");

  setLoading(true);
  setError(null);
  try {
    const url = selectedTreatment
      ? `${API_BASE}/api/treatment-plans/${selectedTreatment._id}`
      : `${API_BASE}/api/treatment-plans`;
    const method = selectedTreatment ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Save failed");
    }

    setShowForm(false);
    setSelectedTreatment(null);
    fetchTreatmentPlans();
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};



  const handleEdit = (treatment) => {
    setSelectedTreatment(treatment);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!token) return;
    if (!window.confirm("Are you sure you want to delete this treatment?")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/treatment-plans/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchTreatmentPlans();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeTreatmentCount = treatmentPlans.filter(t => t.status === "active").length;

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 24 }}>
              <StatCard label="Total Treatments" value={treatmentPlans.length} />
              <StatCard label="Active Treatments" value={activeTreatmentCount} />
            </div>

            {!showForm && (
              <>
                <button
                  onClick={handleAddNew}
                  style={{ backgroundColor: "#1976d2", color: "white", border: "none", padding: "10px 20px", borderRadius: 6, cursor: "pointer", marginBottom: 16 }}
                >
                  Add New Treatment
                </button>

                <button
                  onClick={() => setActiveTab("treatment-plans")}
                  style={{ background: "none", border: "none", color: "#1976d2", cursor: "pointer", fontWeight: "bold", textDecoration: "underline" }}
                >
                  View All Treatments & Plans &rarr;
                </button>
              </>
            )}

            {showForm && (
              <TreatmentForm treatment={selectedTreatment} onSave={handleSave} onCancel={handleCancel} />
            )}
          </>
        );

      case "dosha-assessment":
        return <DoshaAssessmentPage />;
      case "treatment-plans":
        return (
          <TreatmentPlansTab treatments={treatmentPlans} onSavePlan={handleSave} onDeletePlan={handleDelete} />
        );
      case "herbal-medicine":
        return <HerbalMedicinesTab />;
      case "wellness-tracking":
        return <WellnessTrackingTab />;
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "auto" }}>
      <h1>Treatments & Wellness Center</h1>
      <nav style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {[
          { id: "overview", label: "Overview" },
          { id: "dosha-assessment", label: "Dosha Assessment" },
          { id: "treatment-plans", label: "Treatment Plans" },
          { id: "herbal-medicine", label: "Herbal Medicine" },
          { id: "wellness-tracking", label: "Wellness Tracking" },
        ].map((tab) => (
          <button
            key={tab.id}
            style={{ padding: "8px 16px", backgroundColor: activeTab === tab.id ? "#1976d2" : "#ccc", color: activeTab === tab.id ? "white" : "black", border: "none", borderRadius: 4, cursor: "pointer" }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <section>{renderTabContent()}</section>
    </div>
  );
}
