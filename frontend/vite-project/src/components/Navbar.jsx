import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">△</span>
          <span className="logo-text">LandMarket</span>
        </Link>

        <ul className="navbar-links">
          <li>
            <Link to="/">Browse Lands</Link>
          </li>
          <li>
            <Link to="/register">List Property</Link>
          </li>
        </ul>

        <div className="navbar-auth">
          <Link to="/login" className="login-btn">
            Login
          </Link>
          <Link to="/register" className="signup-btn">
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;