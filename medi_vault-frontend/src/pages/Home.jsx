import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiBell, FiUser } from "react-icons/fi";
import "./Home.css";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const features = [
  {
    title: "Medicine Reminder",
    desc: "Never miss a dose again with smart notifications and personalized medication schedules.",
    route: "/medicine-reminder",
    icon: "💊",
  },
  {
    title: "Appointment Reminder",
    desc: "Stay on top of your appointments with intelligent reminders and calendar integration.",
    route: "/appointment-reminder",
    icon: "📅",
  },
  {
    title: "Medical History",
    desc: "Securely store and access your medical records, test results, and health data.",
    route: "/medical-history",
    icon: "📋",
  },
  {
    title: "Vaccination and Surgeries",
    desc: "Track all vaccination dates and surgical history conveniently.",
    route: "/vaccination-surgeries",
    icon: "🏥",
  },
  {
    title: "Blood Group & Allergies",
    desc: "Keep your blood group, allergies, and emergency info ready anytime.",
    route: "/blood-allergies",
    icon: "🩸",
  },
  {
    title: "Ayurveda Treatments",
    desc: "Explore and track holistic treatments and wellness remedies.",
    route: "/ayurveda-treatments",
    icon: "🌿",
  },
];

function Home() {
  const [user, setUser] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully!");
    navigate("/");
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <div className="logo">
            <span className="logo-icon">💙</span>
            <span className="logo-text"><strong>Medi-Vault</strong></span>
          </div>
          <div className="nav-links">
            <Link to="/">Appointments</Link>
            <Link to="/">Prescriptions</Link>
            <Link to="/">Doctors</Link>
            <Link to="/">Emergency</Link>
          </div>
        </div>
        <div className="navbar-right">
          <FiBell className="icon" />

          {user && (
            <>
              <span className="username">Hi, {user.name}!</span>

              <div
                className="profile-menu-wrapper"
                onMouseEnter={() => setDropdownVisible(true)}
                onMouseLeave={() => setDropdownVisible(false)}
                style={{ position: "relative", display: "inline-block" }}
              >
                <FiUser className="icon profile-icon" />

                {dropdownVisible && (
                  <div
                    className="dropdown-menu"
                    style={{
                      position: "absolute",
                      right: 0,
                      backgroundColor: "white",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      borderRadius: "4px",
                      padding: "10px",
                      zIndex: 1000,
                      minWidth: "150px",
                    }}
                  >
                    <Link
                      to="/profile"
                      className="dropdown-item"
                      style={{
                        display: "block",
                        padding: "8px 12px",
                        cursor: "pointer",
                        color: "#333",
                        textDecoration: "none",
                      }}
                    >
                      Your Profile
                    </Link>
                    <div
                      className="dropdown-item"
                      onClick={logout}
                      style={{ padding: "8px 12px", cursor: "pointer", color: "#333" }}
                    >
                      Logout
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {!user && (
            <Link to="/login" className="signin-btn">
              Sign In
            </Link>
          )}
        </div>
      </nav>

      <div className="landing-main">
        <h1 className="landing-title">Your Health, Simplified</h1>
        <p className="landing-desc">
          Take control of your wellness journey with our comprehensive health management platform.<br />
          From medication reminders to finding the right doctor, we've got you covered.
        </p>
        <button
          className="get-started-btn"
          onClick={() => navigate("/login")}
        >
          Get Started Today
        </button>
      </div>

      {/* Feature Cards Section */}
      <div className="features-section">
        <div className="features-grid">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="feature-card"
              onClick={() => navigate(feature.route)}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h2 className="feature-title">{feature.title}</h2>
              <p className="feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Home;
