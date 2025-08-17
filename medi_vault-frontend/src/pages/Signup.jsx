import React, { useState } from "react";
import "./Signup.css";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { signup } from "../api/auth"; // ✅ Import signup API

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",   // ✅ backend expects "name"
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await signup(formData); // ✅ Call signup API
      alert("Signup successful! Please login.");
      console.log("Registered user:", res.data);

      // Optional redirect after signup:
      // window.location.href = "/login";
    } catch (err) {
      console.error("Signup error:", err.response?.data || err);
      alert(err.response?.data?.message || "Signup failed. Try again.");
    }
  };

  return (
    <div className="signup-container">
      {/* Left Section */}
      <div className="signup-left">
        <h1>WELCOME BACK!</h1>
        <p>To keep connected with us please login with your personal info</p>
      </div>

      {/* Right Section */}
      <div className="signup-right">
        <form className="signup-form" onSubmit={handleSubmit}>
          <h2>Sign Up</h2>

          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="text"
              name="name"     // ✅ changed from username → name
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="signup-btn">
            Sign Up
          </button>

          <p className="login-link">
            Already have an account? <a href="/login">Login</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
