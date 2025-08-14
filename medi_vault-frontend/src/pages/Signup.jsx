import React, { useState } from "react";
import { signup } from "../api/auth";

const Signup = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await signup(formData);
      alert("Signup successful! You can now login.");
      console.log("Registered user:", res.data);
    } catch (err) {
      console.error("Signup error:", err.response?.data || err);
      alert(err.response?.data?.message || "Signup failed. Try again.");
    }
  };

  return (
    <div className="signup-page">
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required /><br/>
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required /><br/>
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required /><br/>
        <button type="submit">Signup</button>
      </form>
    </div>
  );
};

export default Signup;
