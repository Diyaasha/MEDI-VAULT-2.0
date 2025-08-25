import React, { useState } from "react";
import "./ForgotPassword.css";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // For now, just simulate sending reset link
    alert(`Password reset link sent to ${email}`);
    navigate("/login"); // redirect back to login
  };

  return (
    <div className="forgot-container">
      <div className="forgot-box">
        <h2>Forgot Password</h2>
        <p>Enter your registered email to receive a password reset link.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Send Reset Link</button>
        </form>
        <p className="back-login" onClick={() => navigate("/login")}>
          Back to Login
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;