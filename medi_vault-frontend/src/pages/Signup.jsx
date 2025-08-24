import React, { useState } from "react";
import "./Signup.css";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { signup } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await signup(formData);

      // Save user data
      localStorage.setItem("user", JSON.stringify(res.data));

      toast.success("Signup successful! Welcome.");

      // Check profile completeness
      const profileRes = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/user/profile`,
        {
          headers: { Authorization: `Bearer ${res.data.token}` },
        }
      );
      const profileData = await profileRes.json();

      if (!profileData.dob || !profileData.gender) {
        navigate("/setup-profile");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Signup error:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Signup failed. Try again.");
    }
  };

  return (
    <div className="signup-page">
      {/* Welcome Section */}
      <div className="welcome-card">
        <h1>Welcome!</h1>
        <h3>For those who care.</h3>
        <p>
          Sign up and discover a smarter way to organize your healthcare.
          <br />
          <strong>Empower your health today!</strong>
        </p>
      </div>

      {/* Signup Form Section */}
      <div className="form-card">
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-header">
            {/* App logo or icon */}
            <img
              src="/logo.png"
              alt="App Logo"
              className="signup-logo"
            />
          </div>

          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="text"
              name="name"
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
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
