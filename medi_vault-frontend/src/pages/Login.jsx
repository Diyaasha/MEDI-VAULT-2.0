import React, { useState } from "react";
import "./Login.css";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { login } from "../api/auth";
import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(formData);
      localStorage.setItem("user", JSON.stringify(res.data)); // save user data
      toast.success("Login successful!");
      navigate("/"); // redirect to Home after login
    } catch (err) {
      console.error("Login error:", err.response?.data || err);
      alert(err.response?.data?.message || "Login failed. Invalid credentials.");
    }
  };

  return (
    <div className="login-container">
      {/* Left Section */}
      <div className="login-left">
        <h1>HELLO, FRIEND!</h1>
        <p>Enter your personal details  </p>
      <p>            Start your journey today with us</p>
      </div>

      {/* Right Section */}
      <div className="login-right">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Login</h2>

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

          <button type="submit" className="login-btn">
            Login
          </button>

          <p className="signup-link">
            Don’t have an account? <a href="/signup">Sign Up</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
