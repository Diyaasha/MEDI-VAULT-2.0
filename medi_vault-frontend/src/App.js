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
      </Routes>

      {/* Add ToastContainer here */}
      <ToastContainer />
    </Router>
  );
}

export default App;
