import React, { useState } from "react";
import "./Login.css";
import { FaEnvelope, FaLock } from "react-icons/fa";
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
    // Replace with your actual login logic, call API, handle errors, etc.
    try {
      // Example:
      // const res = await login(formData);
      // localStorage.setItem("user", JSON.stringify(res.data));
      // toast.success("Login successful!");
      // navigate("/");

      toast.success("Login successful!");
      navigate("/");
    } catch (err) {
      toast.error("Login failed, try again.");
    }
  };

  return (
    <div className="login-bg">
      <div className="login-left-part">
        <div className="left-box">
          <div className="left-title">Welcome Back!</div>
          <div className="left-highlight">For those who care.</div>
          <div style={{ margin: "12px 0", textAlign: "center" }}>
            <span style={{ color: "#4c6959", fontWeight: "bold" }}>
              Empower your health today!<br />
              <br />
            </span>
            Log in and discover a smarter way to organize your healthcare.<br />


          </div>
        </div>
      </div>
      <div className="login-right-part">
        <form className="login-card" onSubmit={handleSubmit}>
          <img src="/logooo.png" alt="logo" style={{ height: 40, width: 40, filter: "drop-shadow(0 2px 6px rgba(0,32,64,0.18))" }} />
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
          <button type="submit" className="login-btn">
            Login
          </button>
          <p className="signup-link">
            Don&apos;t have an account? <a href="/signup">Sign Up</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
