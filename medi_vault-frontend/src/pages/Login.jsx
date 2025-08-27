import React, { useState } from "react";
import "./Signup.css"; // reuse signup styling
import { FaEnvelope, FaLock } from "react-icons/fa";
import { login, googleVerify } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
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

  // Google login handler (replace with your actual OAuth logic)
  const handleGoogleLogin = () => {
    // Example: window.location.href = "/api/auth/google";
    toast.info("Google login coming soon!");
  };

  const onGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error("Google login failed: no credential received");
      return;
    }
    try {
       const res = await googleVerify(credentialResponse.credential);
        console.log("Google verify response data:", res.data);
    localStorage.setItem("user", JSON.stringify(res.data));
    toast.success("Login/signup successful!");

    // Redirect depending on profile completeness
    if (res.data.isProfileComplete === false) {
      navigate("/setup-profile"); // your profile completion page
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
    <div className="signup-bg">
      <div className="signup-left-part">
        <div className="left-box">
          <br />
          <br />
          <div className="left-title">Welcome Back!</div>
          <div className="left-desc">
            <br />
            Log back in and continue managing your health with ease.
            <br />
            <br />
            <br />
            <span style={{ color: "#4c6959ff", fontWeight: "bold" }}>
              Secure. Easy. Personalized.
            </span>
          </div>
          <div className="left-note">
            <br />
            Sign in and continue your journey with MEDI-VAULT!
          </div>
        </div>
      </div>

      <div className="signup-right-part">
        <form className="right-box" onSubmit={handleSubmit}>
          <img
            src="/logooo.png"
            alt="logo"
            style={{
              height: 40,
              width: 40,
              filter: "drop-shadow(0 2px 6px rgba(0,32,64,0.18))",
            }}
          />
          <br />

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
            Login
          </button>

          <p className="signup-link">
            Don&apos;t have an account? <a href="/signup">Sign Up</a>
          </p>

          <div className="forgot-password-bottom">
            <button
              type="button"
              onClick={() => (window.location.href = "/forgot-password")}
            >
              Forgot Password?
            </button>
          </div>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <GoogleLogin
            onSuccess={onGoogleSuccess}
            onError={onGoogleError}
            useOneTap
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
