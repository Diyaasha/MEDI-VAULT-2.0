import React, { useEffect, useState } from "react";
import Modal from "../components/Modal";
import usePageTitle from '../hooks/usePageTitle';
import './Profile.css';

const Profile = () => {
  usePageTitle('Profile');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [formData, setFormData] = useState({});

  const storedUser = localStorage.getItem("user");
  const token = storedUser ? JSON.parse(storedUser).token : null;

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/user/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setUserData(data);
        setFormData({
          ...data,
          allergies: Array.isArray(data.allergies)
            ? data.allergies
            : (data.allergies || "").split(",").map(a => a.trim()).filter(a => a),
        });
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch profile", error);
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const calculateAge = dob => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleEditClick = () => {
    setPassword("");
    setVerificationError("");
    setIsModalOpen(true);
  };

  const verifyPassword = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/user/profile/verify-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password }),
        }
      );
      if (res.ok) {
        setEditing(true);
        setIsModalOpen(false);
        setVerificationError("");
      } else {
        setVerificationError("Password incorrect. Please try again.");
      }
    } catch (error) {
      setVerificationError("Failed to verify password.");
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const sendData = {
        ...formData,
        allergies:
          typeof formData.allergies === "string"
            ? formData.allergies.split(",").map(a => a.trim()).filter(a => a)
            : formData.allergies,
      };
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/user/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(sendData),
        }
      );
      if (res.ok) {
        const updatedData = await res.json();
        setUserData(updatedData);
        setEditing(false);
        alert("Profile updated successfully");
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      alert("Error updating profile");
    }
  };

  if (loading) return <p></p>;

  return (
    <div className="profile-page">
      <h2 className="profile-header-title">Patient Profile</h2>
      {!userData ? (
        <p>No profile data found.</p>
      ) : (
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar" title={userData.gender || "User"}>
              <span role="img" aria-label="User">
                👤
              </span>
            </div>
            <div className="profile-main-info">
              <h1>{userData.name || "User"}</h1>
              <span className="profile-age">
                DOB: {userData.dob ? new Date(userData.dob).toLocaleDateString() : "N/A"}{" "}
                {userData.dob && <>({calculateAge(userData.dob)} years old)</>}
              </span>
            </div>
          </div>

          {!editing ? (
            <>
              <div className="profile-grid">
                <div className="profile-info-card">
                  <div className="profile-info-title">Gender</div>
                  <div className="profile-info-value">{userData.gender || "N/A"}</div>
                </div>
                <div className="profile-info-card">
                  <div className="profile-info-title">Blood Group</div>
                  <div className="profile-info-value">{userData.bloodGroup || "N/A"}</div>
                </div>
                <div className="profile-info-card">
                  <div className="profile-info-title">Weight</div>
                  <div className="profile-info-value">{userData.weight || "N/A"} kg</div>
                </div>
                <div className="profile-info-card">
                  <div className="profile-info-title">Height</div>
                  <div className="profile-info-value">{userData.height || "N/A"} cm</div>
                </div>
                <div className="profile-info-card">
                  <div className="profile-info-title">Blood-Glucose Level</div>
                  <div className="profile-info-value">{userData.blood_glucose || "N/A"}</div>
                </div>
                <div className="profile-info-card">
                  <div className="profile-info-title">Eye Power (L)</div>
                  <div className="profile-info-value">{userData.eyePowerL || "N/A"}</div>
                </div>
                <div className="profile-info-card">
                  <div className="profile-info-title">Eye Power (R)</div>
                  <div className="profile-info-value">{userData.eyePowerR || "N/A"}</div>
                </div>
              </div>
              <div className="profile-special-row">
                <div className="profile-section-title">Allergies</div>
                {userData.allergies && userData.allergies.length ? (
                  <ul style={{ margin: 0 }}>
                    {userData.allergies.map((allergy, idx) => (
                      <li key={idx}>{allergy}</li>
                    ))}
                  </ul>
                ) : (
                  <span>None</span>
                )}
              </div>
              <button className="edit-btn" onClick={handleEditClick}>
                Edit Profile
              </button>
            </>
          ) : (
            <div className="profile-edit">
              <div className="edit-field">
                <label>Name:</label>
                <input name="name" value={formData.name || ""} onChange={handleChange} />
              </div>
              <div className="edit-field">
                <label>DOB:</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob ? formData.dob.slice(0, 10) : ""}
                  onChange={handleChange}
                />
              </div>
              <div className="edit-field">
                <label>Gender:</label>
                <select name="gender" value={formData.gender || ""} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="edit-field">
                <label>Blood Group:</label>
                <input name="bloodGroup" value={formData.bloodGroup || ""} onChange={handleChange} />
              </div>
              <div className="edit-field">
                <label>Weight:</label>
                <input name="weight" value={formData.weight || ""} onChange={handleChange} />
              </div>
              <div className="edit-field">
                <label>Height:</label>
                <input name="height" value={formData.height || ""} onChange={handleChange} />
              </div>
              <div className="edit-field">
                <label>Eye Power (L):</label>
                <input name="eyePowerL" value={formData.eyePowerL || ""} onChange={handleChange} />
              </div>
              <div className="edit-field">
                <label>Eye Power (R):</label>
                <input name="eyePowerR" value={formData.eyePowerR || ""} onChange={handleChange} />
              </div>
              <div className="edit-field">
                <label>Primary Doctor:</label>
                <input name="primaryDoctor" value={formData.primaryDoctor || ""} onChange={handleChange} />
              </div>
              <div className="edit-field">
                <label>Allergies (comma separated):</label>
                <input
                  name="allergies"
                  value={
                    Array.isArray(formData.allergies)
                      ? formData.allergies.join(", ")
                      : formData.allergies || ""
                  }
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      allergies: e.target.value.split(",").map(a => a.trim()).filter(a => a),
                    }))
                  }
                />
              </div>
              <div className="edit-buttons">
                <button className="save-btn" onClick={handleSave}>
                  Save
                </button>
                <button className="cancel-btn" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Component */}
      <Modal
        isOpen={isModalOpen}
        title="Enter Password to Edit Profile"
        onClose={() => setIsModalOpen(false)}
        onVerify={verifyPassword}
      >
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "10px" }}
        />
        {verificationError && <p style={{ color: "red" }}>{verificationError}</p>}
      </Modal>
    </div>
  );
};

export default Profile;
