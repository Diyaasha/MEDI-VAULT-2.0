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
      localStorage.setItem("user", JSON.stringify(res.data));
      toast.success("Signup successful! Welcome.");

      // Optional profile completeness logic
      const profileRes = await fetch(
        `${process.env.REACT_APP_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3000' : 'https://medi-vault-zsg1.onrender.com')}/api/user/profile`,
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
      alert(err.response?.data?.message || "Signup failed. Try again.");
    }
  };

  return (
    <div className="signup-bg">
      <div className="signup-left-part">
        <div className="left-box">
          <br /><br />
          <div className="left-title">Welcome to MEDI-VAULT!</div>
          <div className="left-desc"><br />
            Join a smarter way to organize your health.<br />
            <br /><br />
          <span style={{color:"#4c6959ff",fontWeight:"bold"}}> Secure. Easy. Personalized.</span> 
          </div>
          <div className="left-note"><br />
            Sign up with your personal info to begin your journey!
          </div>
        </div>
      </div>
      <div className="signup-right-part">
        <form className="right-box" onSubmit={handleSubmit}>
           <img src="/logooo.png" alt="logo" style={{height:40, width:40, filter:"drop-shadow(0 2px 6px rgba(0,32,64,0.18))"}} />
          <br />
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
