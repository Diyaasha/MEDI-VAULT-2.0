import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MedicineReminder from "./pages/MedicineReminder";
// Import other feature pages as needed

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public landing/Home page */}
        <Route path="/" element={<Home />} />

        {/* Login & Signup: Redirect logged-in users to home */}
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

        {/* Medicine Reminder - Protected */}
        <Route
          path="/medicine-reminder"
          element={
            <ProtectedRoute>
              <MedicineReminder />
            </ProtectedRoute>
          }
        />

        {/* Add other protected feature routes here wrapping with ProtectedRoute */}
      </Routes>
    </Router>
  );
}

export default App;
