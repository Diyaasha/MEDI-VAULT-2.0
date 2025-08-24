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
      <nav className="navbar">
        <div className="navbar-left" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src="/logooo.png"
            alt="MEDI-VAULT logo"
            style={{
              height: "38px",
              width: "38px",
              objectFit: "contain",
              marginRight: "6px",
              filter: "drop-shadow(0 1px 2px rgba(0, 5, 9, 0.28))"
            }}
          />
          <span className="logo-text">
            <strong>MEDI-VAULT</strong>
          </span>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/">About</Link>
            <Link to="/">My Profile</Link>
            <Link to="/">Contact-Us</Link>
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
                        color: "#333"
                      }}
                    >
                      Logout
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
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
            Empower your health journey with a secure, AI-powered platform.<br />
            Store prescriptions, lab reports, and track medicines.<br />
            Connect with doctors and manage all your medical needs—just a click away!
          </p>
        

          <button className="get-started-btn" onClick={() => navigate("/login")}>
            Get Started
          </button>
             <div className="about-outer-wrap">
  <button
    className="about-btn"
    onClick={() => window.scrollTo({top: 0, behavior:'smooth'})}
    title="Learn more about Medivault"
  >
    <span role="img" aria-label="info" style={{marginRight:8}}></span> About
  </button>
  <div className="about-text">
    <h2>Welcome to Medivault</h2>
    <p>
      <b>Your all-in-one healthcare companion.</b> Medivault empowers you to take charge of your wellness journey—simply, securely, and personally.<br /><br />
      <span className="about-highlight">Effortless Health Management:</span> Seamlessly organize prescriptions, track vital records, set medication reminders, and access your entire health history—anytime, anywhere.<br /><br />
      <span className="about-highlight">Smarter, Safer:</span> Built with cutting-edge technology and privacy in mind, Medivault brings trusted providers and AI-powered health summaries to your fingertips.<br /><br />
      <i>Join thousands transforming their healthcare experience.
      <br/>Take control, stay informed, and live healthier with Medivault by your side.</i>
      <span className="about-signature">
        <br /><br />Your health. Your vault. Your peace of mind.
      </span>
    </p>
  </div>
  
</div>

           


        </div>
      )}

      <div className="feature-hero">
        <div className="feature-label"><button>Features</button></div>
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

      {/* Place Footer here, outside of navbar, after all content */}
      {!user && (
        <footer className="glass-footer">
          <div className="footer-grid">
            {/* About Section */}
            <div className="footer-col about-section">
              <div className="footer-logo-and-title">
                <img src="/logooo.png" alt="logo" className="footer-logo-icon" style={{height:"2rem", width:"2rem", marginRight:8}}/>
                <div>
                  <div className="footer-app-title">MEDI-VAULT</div>
                  <div className="footer-app-sub">Healthcare Simplified</div>
                </div>
              </div>
              <div className="footer-desc">
                A comprehensive Flutter mobile app designed to help users manage medical prescriptions, reports,
                medicine reminders, appointments, and medical history—all in one secure platform.
              </div>
              <div className="footer-tags">
                <span className="footer-tag">Flutter</span>
                <span className="footer-tag">Firebase</span>
                <span className="footer-tag">Healthcare</span>
              </div>
            </div>
            {/* Quick Links & Features */}
            <div className="footer-col links-section">
              <div className="footer-section">
                <div className="footer-section-title">Quick Links</div>
                <ul>
                  <li><a href="/">Home</a></li>
                  <li><a href="/">About</a></li>
                  <li><a href="/">Features</a></li>
                  <li><a href="/">Screenshots</a></li>
                  
                </ul>
              </div>
              <div className="footer-section">
                <div className="footer-section-title">App Features</div>
                <ul>
                  <li>Medicine & Appointment Reminders</li>
                  <li>Prescription & Report Upload</li>
                  <li>Doctor & Hospital Search</li>
                  <li>Emergency Services Access</li>
                </ul>
              </div>
            </div>
            {/* Download and Contact */}
            <div className="footer-col action-section">
              <div className="footer-section-title"><button className="footer-download-btn" onClick={() => navigate("/login")}>Get Started</button></div>
     
              <div className="footer-contact-section">
                <div className="footer-section-title" style={{ marginTop: 16 }}>Contact Developers</div>
                <div className="footer-contact">DiptanshuVishwa:diptanshuvishwa364@gmail.com<br/>Diyasha Nag:diyashanag23@gmail.com<br/>Ashwin Yadav:<br/>ashwinyadavv@gmail.com</div>
              <br/>  <div className="footer-contact"> <img src="/25231.png" alt="logo" className="footer-logo-icon" style={{height:"2rem", width:"2rem", marginRight:8}}/> <a href="https://github.com/DiptanshuVishwa/MEDI-VAULT.git" target="_blank" rel="noopener noreferrer">https://github.com/DiptanshuVishwa/MEDI-VAULT.git</a></div>
 
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
export default Home;
