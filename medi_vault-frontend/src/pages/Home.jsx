import { Link } from "react-router-dom";
import { FiBell, FiUser } from "react-icons/fi";
import "./Home.css";

function Home() {
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
          <FiUser className="icon" />
          <Link to="/login" className="signin-btn">Sign In</Link>
        </div>
      </nav>

      <div className="home-container">
        <h1>Medi-Vault</h1>
        <p>Your personal health vault – secure, simple, and smart.</p>
        <div className="home-buttons">
          <Link to="/login"><button>Login</button></Link>
          <Link to="/signup"><button>Signup</button></Link>
        </div>
      </div>
    </>
  );
}

export default Home;
