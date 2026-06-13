import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MedicineReminder from "./pages/MedicineReminder";
import Profile from "./pages/Profile";
import SetupProfile from "./pages/SetupProfile";
import MedicalFacilitiesMap from "./components/MedicalFacilitiesMap";
import MedicalHistory from "./pages/MedicalHistory";
import ForgotPassword from "./pages/ForgotPassword";

// ProtectedRoute and PublicRoute wrappers
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

// Existing new import for AI docs
import MedicalDocumentsPage from "./components/MedicalDocumentsPage";

// Import Vaccinations and Surgeries page/component (create if not existing)
import VaccinationAndSurgery from "./pages/vaccinationAndSurgery";

import DoshaAssessmentPage from "./pages/DoshaAssessmentPage";
import HerbalMedicinesTab from "./components/HerbalMedicinesTab";
import WellnessTrackingTab from "./components/WellnessTrackingTab";
import AIHealthRiskPage from "./pages/AIHealthRiskPage";
import AIHealthAssistantPage from "./pages/AIHealthAssistantPage";



function App() {
  return (
    <Router>
      <Routes>
        {/* Public landing/Home page */}
        <Route path="/" element={<Home />} />

        {/* Login & Signup */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

        {/* Forgot Password (Public) */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route
          path="/medicine-reminder"
          element={
            <ProtectedRoute>
              <MedicineReminder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/setup-profile"
          element={
            <ProtectedRoute>
              <SetupProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/medical-facilities"
          element={
            <ProtectedRoute>
              <MedicalFacilitiesMap />
            </ProtectedRoute>
          }
        />

        <Route
          path="/medical-history"
          element={
            <ProtectedRoute>
              <MedicalHistory />
            </ProtectedRoute>
          }
        />

        {/* NEW Routes for Vaccinations and Surgeries */}
        <Route
  path="/vaccination-and-surgery"
  element={
    <ProtectedRoute>
      <VaccinationAndSurgery />
    </ProtectedRoute>
  }
/>

        {/* NEW: AI Simplified Docs Upload & List */}
        <Route
          path="/ai-simplified"
          element={
            <ProtectedRoute>
              <MedicalDocumentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ai-health-risk"
          element={
            <ProtectedRoute>
              <AIHealthRiskPage />
            </ProtectedRoute>
          }
        />
<Route
  path="/dosha-assessment"
  element={
    <ProtectedRoute>
      <DoshaAssessmentPage />
    </ProtectedRoute>
  }
/>
<Route path="/herbal-medicines" element={<HerbalMedicinesTab />} />
<Route path="/wellness-tracking" element={<WellnessTrackingTab />} />

        {/* AI Health Assistant Chatbot */}
        <Route
          path="/ai-health-assistant"
          element={
            <ProtectedRoute>
              <AIHealthAssistantPage />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Toast Notifications */}
      <ToastContainer />
    </Router>
  );
}

export default App;
