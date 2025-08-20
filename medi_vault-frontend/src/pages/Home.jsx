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
    route: "/Medicine-Reminder",
    icon: "💊",
  },
  {
    title: "Medical History",
    desc: "Securely store and access your medical records, test results, and health checkups.",
    route: "/Medical-History",
    icon: "📋",
  },
  {
    title: "Vaccinations & Surgeries",
    desc: "Track all vaccination dates and your surgical history conveniently in one place.",
    route: "/vaccination-surgeries",
    icon: "💉",
  },
  {
    title: "Find Medical Facilities",
    desc: "Locate nearby hospitals, clinics, and doctors quickly when you need care.",
    route: "/hospitals-clinics-doctors",
    icon: "🏥",
  },
  {
    title: "Insurance Details",
    desc: "Keep your insurance, emergency info, and blood group details ready anytime.",
    route: "/insurance-details",
    icon: "💼",
  },
  {
    title: "Treatments & Wellness",
    desc: "Explore and track holistic treatments, therapies, and wellness remedies.",
    route: "/treatments",
    icon: "⚕️",
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
            <span className="logo-icon">🩺</span>
            <span className="logo-text">
              <strong>MEDI-VAULT</strong>
            </span>
          </div>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/">About-Us</Link>
            <Link to="/">My Profile</Link>
            <Link to="/">Contact-Us</Link>
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
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        color: "#333",
                      }}
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

      {!user && (
        <div className="landing-main floating-center">
          <h1 className="landing-title">Hassle-Free Healthcare.</h1>
          <p className="custom-subtext">
            Empower your health journey with a secure, AI-powered platform.
            <br />
            Store prescriptions, lab reports, and track medicines.
            <br />
            Connect with doctors and manage all your medical needs—just a click away!
          </p>
          <button className="get-started-btn" onClick={() => navigate("/login")}>
            Get Started
          </button>
        </div>
      )}

      {/* Feature Label Only */}
      <div className="feature-hero">
        <div className="feature-label">Features</div>
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
