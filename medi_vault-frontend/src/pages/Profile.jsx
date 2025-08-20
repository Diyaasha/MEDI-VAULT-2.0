import React, { useEffect, useState } from "react";
import Modal from "../components/Modal";

const Profile = () => {
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
      window.location.href = "/login"; // Redirect if not logged in
      return;
    }
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/user/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setUserData(data);
        setFormData(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch profile", error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const calculateAge = (dob) => {
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
        `${
          process.env.REACT_APP_API_URL || "http://localhost:3000"
        }/api/user/profile/verify-password`,
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/user/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
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

  if (loading) return <p>Loading...</p>;

  return (
    <div className="profile-page" style={{ background: "white", minHeight: "100vh", padding: "20px" }}>
      <h2>Patient Profile</h2>
      {!userData ? (
        <p>No profile data found.</p>
      ) : (
        <>
          {!editing ? (
            <div className="profile-view">
              <p>
                <strong>Name:</strong> {userData.name}
              </p>
              <p>
                <strong>DOB:</strong>{" "}
                {userData.dob ? new Date(userData.dob).toLocaleDateString() : "N/A"} (
                {calculateAge(userData.dob)} years old)
              </p>
              <p>
                <strong>Gender:</strong> {userData.gender || "N/A"}
              </p>
              <p>
                <strong>Blood Group:</strong> {userData.bloodGroup || "N/A"}
              </p>
              <p>
                <strong>Weight:</strong> {userData.weight || "N/A"}
              </p>
              <p>
                <strong>Height:</strong> {userData.height || "N/A"}
              </p>
              <p>
                <strong>Eye Power (L):</strong> {userData.eyePowerL || "N/A"}
              </p>
              <p>
                <strong>Eye Power (R):</strong> {userData.eyePowerR || "N/A"}
              </p>
              <p>
                <strong>Allergies:</strong>{" "}
                {userData.allergies && userData.allergies.length > 0
                  ? userData.allergies.join(", ")
                  : "None"}
              </p>
              <button onClick={handleEditClick}>Edit Profile</button>
            </div>
          ) : (
            <div className="profile-edit">
              <label>
                Name:
                <input name="name" value={formData.name || ""} onChange={handleChange} />
              </label>
              <br />
              <label>
                DOB:
                <input
                  type="date"
                  name="dob"
                  value={formData.dob ? formData.dob.slice(0, 10) : ""}
                  onChange={handleChange}
                />
              </label>
              <br />
              <label>
                Gender:
                <select name="gender" value={formData.gender || ""} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <br />
              <label>
                Blood Group:
                <input name="bloodGroup" value={formData.bloodGroup || ""} onChange={handleChange} />
              </label>
              <br />
              <label>
                Weight:
                <input name="weight" value={formData.weight || ""} onChange={handleChange} />
              </label>
              <br />
              <label>
                Height:
                <input name="height" value={formData.height || ""} onChange={handleChange} />
              </label>
              <br />
              <label>
                Eye Power (L):
                <input name="eyePowerL" value={formData.eyePowerL || ""} onChange={handleChange} />
              </label>
              <br />
              <label>
                Eye Power (R):
                <input name="eyePowerR" value={formData.eyePowerR || ""} onChange={handleChange} />
              </label>
              <br />
              <label>
                Allergies (comma separated):
                <input
                  name="allergies"
                  value={formData.allergies ? formData.allergies.join(", ") : ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      allergies: e.target.value.split(",").map((a) => a.trim()),
                    }))
                  }
                />
              </label>
              <br />
              <button onClick={handleSave}>Save</button>{" "}
              <button onClick={() => setEditing(false)}>Cancel</button>
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        title="Enter Password to Edit Profile"
        onClose={() => setIsModalOpen(false)}
      >
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "10px" }}
        />
        {verificationError && <p style={{ color: "red" }}>{verificationError}</p>}
        <button onClick={verifyPassword} style={{ marginTop: "12px" }}>
          Verify
        </button>
      </Modal>
    </div>
  );
};

export default Profile;
