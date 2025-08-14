import React, { useState } from "react";
import axios from "axios";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // ✅ Correct backend URL
      const res = await axios.post("http://localhost:3000/api/auth/login", formData);
      alert(res.data.message); // e.g., Login successful
      console.log("Logged in user:", res.data.user);
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed. Invalid credentials.");
    }
  };

  return (
    <div className="login-page">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        /><br/>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        /><br/>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
