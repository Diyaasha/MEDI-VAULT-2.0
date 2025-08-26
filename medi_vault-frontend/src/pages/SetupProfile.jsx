import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SetupProfile.css";

const SetupProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    dob: "",
    gender: "",
    bloodGroup: "",
    weight: "",
    height: "",
    eyePowerL: "",
    eyePowerR: "",
    allergies: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const storedUser = localStorage.getItem("user");
  const token = storedUser ? JSON.parse(storedUser).token : null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Convert allergies string to array by splitting on commas
    const allergiesArray = formData.allergies
      .split(",")
      .map((allergy) => allergy.trim())
      .filter((allergy) => allergy.length > 0);

    const payload = {
      dob: formData.dob,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      weight: formData.weight,
      height: formData.height,
      eyePowerL: formData.eyePowerL,
      eyePowerR: formData.eyePowerR,
      allergies: allergiesArray,
    };

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/user/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        setLoading(false);
        navigate("/"); 
      } else {
        const errData = await res.json();
        setError(errData.message || "Failed to update profile");
        setLoading(false);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="setup-profile-page">
      <div className="setup-profile-card">
        <h2>Complete Your Profile</h2>
        <form onSubmit={handleSubmit} className="setup-form">
          <label>
            Date of Birth:
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Gender:
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label>
            Blood Group:
            <input
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Weight:
            <input
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              placeholder="e.g. 75 kg"
            />
          </label>

          <label>
            Height:
            <input
              name="height"
              value={formData.height}
              onChange={handleChange}
              placeholder="e.g. 175 cm"
            />
          </label>

          <label>
            Eye Power (L):
            <input
              name="eyePowerL"
              value={formData.eyePowerL}
              onChange={handleChange}
            />
          </label>

          <label>
            Eye Power (R):
            <input
              name="eyePowerR"
              value={formData.eyePowerR}
              onChange={handleChange}
            />
          </label>

          <label>
            Allergies (comma separated):
            <input
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              placeholder="e.g. Peanuts, Penicillin"
            />
          </label>

          {error && <p className="error-message">{error}</p>}

          <div className="setup-buttons">
            <button type="submit" disabled={loading} className="save-btn">
              {loading ? "Saving..." : "Save and Continue"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetupProfile;
