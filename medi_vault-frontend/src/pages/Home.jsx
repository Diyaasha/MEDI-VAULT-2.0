import { Link, useNavigate } from "react-router-dom";
import { FiBell, FiUser } from "react-icons/fi";
import "./Home.css";
import { useEffect, useState } from "react";

import { toast } from "react-toastify";

function Home() {
  const [user, setUser] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user info from localStorage
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
                  <div className="dropdown-menu" style={{
                    position: "absolute",
                    right: 0,
                    backgroundColor: "white",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    borderRadius: "4px",
                    padding: "10px",
                    zIndex: 1000,
                    minWidth: "150px"
                  }}>
                    <Link to="/profile" className="dropdown-item" style={{ display: "block", padding: "8px 12px", cursor: "pointer", color: "#333", textDecoration: "none" }}>
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
            <Link to="/login" className="signin-btn">Sign In</Link>
          )}
        </div>
      </nav>

      <div className="home-container">
        <h1>Medi-Vault</h1>
        <p>Your personal health vault – secure, simple, and smart.</p>
        <div className="home-buttons">
          {!user && <Link to="/login"><button>Login</button></Link>}
          {!user && <Link to="/signup"><button>Signup</button></Link>}
        </div>
      </div>
    </>
  );
}

export default Home;
