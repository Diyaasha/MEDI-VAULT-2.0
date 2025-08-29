import React, { useState } from "react";
import "./Login.css"; 
import { FaEnvelope, FaLock } from "react-icons/fa";
import { login, googleVerify } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(formData);
      localStorage.setItem("user", JSON.stringify(res.data));
      toast.success("Login successful!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Invalid credentials.");
    }
  };

  const onGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error("Google login failed: no credential received");
      return;
    }
    try {
      const res = await googleVerify(credentialResponse.credential);
      localStorage.setItem("user", JSON.stringify(res.data));
      toast.success("Login/signup successful!");

      if (res.data.isProfileComplete === false) {
        navigate("/setup-profile");
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Google login/signup failed.");
    }
  };

  const onGoogleError = () => {
    toast.error("Google login/signup failed.");
  };

  return (
    <div className="login-bg">
      {/* Left Part */}
      <div className="login-left-part">
        <div className="left-box">
          <div className="left-title">Welcome Back!</div>
          <div className="left-desc">
            Log back in and continue managing your health with ease.
            <br />
            <br />
            <span style={{ color: "#4c6959ff", fontWeight: "bold" }}>
              Secure. Easy. Personalized.
            </span>
          </div>
          <div className="left-note">
            Sign in and continue your journey with MEDI-VAULT!
          </div>
        </div>
      </div>

      {/* Right Part */}
      <div className="login-right-part">
        <form className="login-card" onSubmit={handleSubmit}>
          <img
            src="/logooo.png"
            alt="logo"
            style={{
              height: 40,
              width: 40,
              filter: "drop-shadow(0 2px 6px rgba(0,32,64,0.18))",
              marginBottom: "15px",
            }}
          />

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

          
          <div className="google-login-container">
            <GoogleLogin onSuccess={onGoogleSuccess} onError={onGoogleError} useOneTap />
          </div>

          <p className="signup-link">
            Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
          </p>

       
          <div className="forgot-password-bottom">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
