import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiBell, FiUser } from "react-icons/fi";
import { toast } from "react-toastify";
import "./Home.css";

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
    route: "/medical-history",
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
    route: "/medical-facilities",
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
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (err) {
        console.error("Failed parsing user from localStorage:", err);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully!");
    navigate("/");
  };

  return (
    <div className="home-page">
      {/* Navbar */}
      <nav className="navbar">
        <div
          className="navbar-left"
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          <img
            src="/logooo.png"
            alt="MEDI-VAULT logo"
            style={{
              height: "38px",
              width: "38px",
              objectFit: "contain",
              marginRight: "6px",
              filter: "drop-shadow(0 1px 2px rgba(0, 5, 9, 0.28))",
            }}
          />
          <span className="logo-text">
            <strong>MEDI-VAULT</strong> 
            {/* color black */}
          </span>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <a href="#features" className="feature-hero">Features</a>
            <a href="#about" className="nav-link">About</a>
            <Link to="/profile">My Profile</Link>
          </div>
        </div>

        <div className="navbar-right">
          <FiBell className="icon" />
          {user ? (
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
          ) : (
            <Link to="/login" className="signin-btn">Sign In</Link>
          )}
        </div>
      </nav>

      {/* Hero Section (only if no user is logged in) */}
      {!user && (
        <div className="landing-main floating-center">
          <h1 className="landing-title">Hassle-Free Healthcare.</h1>
          <p className="custom-subtext">
            Empower your health journey with a secure, AI-powered platform.<br />
            Store prescriptions, lab reports, and track medicines.<br />
            Connect with doctors and manage all your medical needs—just a click away!
          </p>
          <button className="get-started-btn" onClick={() => navigate("/login")}>
            Get Started
          </button>
        </div>
      )}

      {/* Features */}
      <div id="features" className="feature-hero">
        <div className="feature-label">Features</div>
      </div>
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

      {/* About Section */}
      <div id="about" className="about-outer-wrap">
        <button className="about-btn">About</button>
        <div className="about-text">
          <h2>Welcome to Medivault</h2>
          <p>
            <b>Your all-in-one healthcare companion.</b> Medivault empowers you to take charge of your wellness journey—simply, securely, and personally.<br /><br />
            <span className="about-highlight">Effortless Health Management:</span> Organize prescriptions, track vital records, set reminders, and access your entire health history anytime.<br /><br />
            <span className="about-highlight">Smarter, Safer:</span> Built with cutting-edge technology and privacy in mind, Medivault brings trusted providers and AI-powered health summaries.<br /><br />
            <i>Join thousands transforming their healthcare experience.<br />Take control, stay informed, and live healthier with Medivault by your side.</i>
            <span className="about-signature">
              <br /><br />Your health. Your vault. Your peace of mind.
            </span>
          </p>
        </div>
      </div>

      {/* Footer (Always visible now) */}
      <footer className="glass-footer">
        <div id="footer-grid" className="footer-grid">
          {/* About Section */}
          <div className="footer-col about-section">
            <div className="footer-logo-and-title">
              <img src="/logooo.png" alt="logo" className="footer-logo-icon" style={{ height: "2rem", width: "2rem", marginRight: 8 }} />
              <div>
                <div className="footer-app-title">MEDI-VAULT</div>
                <div className="footer-app-sub">Healthcare Simplified</div>
              </div>
            </div>
            <div className="footer-desc">
              A comprehensive platform to help users manage prescriptions, reports, reminders, appointments, and medical history—all in one secure vault.
            </div>
            <div className="footer-tags">
              <span className="footer-tag">React</span>
              <span className="footer-tag">Firebase</span>
              <span className="footer-tag">Healthcare</span>
            </div>
          </div>
          {/* Links */}
          <div className="footer-col links-section">
            <div className="footer-section">
              <div className="footer-section-title">Quick Links</div>
              <ul>
                <li><a href="/">Home</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="/">Contact</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <div className="footer-section-title">App Features</div>
              <ul>
                <li>Medicine Reminders</li>
                <li>Prescription & Report Upload</li>
                <li> Hospital & Clinic Search</li>
                <li>AI Health Summariser</li>
              </ul>
            </div>
          </div>
          {/* Actions */}
          <div className="footer-col action-section">
            <div className="footer-section-title">
              <button className="footer-download-btn" onClick={() => navigate("/login")}>
                Get Started
              </button>
            </div>
            <div className="footer-contact-section">
              <div className="footer-section-title" style={{ marginTop: 16 }}>Contact Developers</div>
              <div className="footer-contact">
                Diptanshu Vishwa: diptanshuvishwa364@gmail.com<br /><br />
                Diyasha Nag: diyashanag23@gmail.com<br /><br />
                Ashwin Yadav: ashwinyadavv@gmail.com
              </div>
              <br />
              <div className="footer-contact">
                <img src="/25231.png" alt="logo" className="footer-logo-icon" style={{ height: "2rem", width: "2rem", marginRight: 8 }} />
                <a href="https://github.com/DiptanshuVishwa/MEDI-VAULT.git" target="_blank" rel="noopener noreferrer">
                  GitHub Repository
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
