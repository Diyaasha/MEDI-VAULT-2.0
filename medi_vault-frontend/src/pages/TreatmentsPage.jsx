import React, { useState, useEffect } from "react";
import DoshaAssessmentPage from "./DoshaAssessmentPage";
import TreatmentList from "../components/TreatmentList";
import TreatmentForm from "../components/TreatmentForm";
import TreatmentPlansTab from "../components/TreatmentPlansTab";
import HerbalMedicinesTab from "../components/HerbalMedicinesTab";
import WellnessTrackingTab from "../components/WellnessTrackingTab";
import usePageTitle from '../hooks/usePageTitle';
import "./TreatmentPage.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function TreatmentsPage() {
  usePageTitle('Treatments & Wellness');
  const [activeTab, setActiveTab] = useState("overview");
  const [treatmentPlans, setTreatmentPlans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")).token
    : null;

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
    if (!window.confirm("Are you sure you want to delete this treatment?"))
      return;
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

  const activeTreatmentCount = treatmentPlans.filter(
    (t) => t.status === "active"
  ).length;

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <>
            <div className="stats-container">
              <StatCard
                label="Total Treatments"
                value={treatmentPlans.length}
              />
              <StatCard
                label="Active Treatments"
                value={activeTreatmentCount}
              />
            </div>

            {!showForm && (
              <>
                <button className="primary-btn" onClick={handleAddNew}>
                  + Add New Treatment
                </button>

                <button
                  className="link-btn"
                  onClick={() => setActiveTab("treatment-plans")}
                >
                  View All Treatments & Plans →
                </button>
              </>
            )}

            {showForm && (
              <TreatmentForm
                treatment={selectedTreatment}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            )}
          </>
        );

      case "dosha-assessment":
        return <DoshaAssessmentPage />;
      case "treatment-plans":
        return (
          <TreatmentPlansTab
            treatments={treatmentPlans}
            onSavePlan={handleSave}
            onDeletePlan={handleDelete}
          />
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
    <div className="treatments-page">
      <h1 className="page-title">Treatments & Wellness Center</h1>

      <nav className="tabs-nav">
        {[
          { id: "overview", label: "Overview" },
          { id: "dosha-assessment", label: "Dosha Assessment" },
          { id: "treatment-plans", label: "Treatment Plans" },
          { id: "herbal-medicine", label: "Herbal Medicine" },
          { id: "wellness-tracking", label: "Wellness Tracking" },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className="tab-content">{renderTabContent()}</section>
    </div>
  );
}
