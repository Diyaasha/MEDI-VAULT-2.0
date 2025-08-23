import React, { useState } from "react";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.success("Login successful!");
    navigate("/");
  };

  return (
    <div className="login-bg">
      <div className="login-left-part">
        <div className="left-box">
          <div className="left-title">Welcome! </div>
          <div className="left-highlight">
            For those who care.
          </div>
          <div className="left-note">
            Log in and discover a smarter way to organize your healthcare.

<br/>
            <br/>
            <span style={{color:"#4c6959ff",fontWeight:"bold"}}>Empower your health today!</span>
          </div>
        </div>
      </div>
      <div className="login-right-part">
        <form className="login-card" onSubmit={handleSubmit}>
          <div className="login-logo">
            <img src="/logooo.png" alt="logo" style={{height:40, width:40, filter:"drop-shadow(0 2px 6px rgba(0,32,64,0.18))"}} />
          </div>
          <div className="login-title"></div>
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
          <button type="submit" className="login-btn">Login</button>
          <div className="signup-link">
            Don't have an account? <a href="/signup">Sign Up</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
