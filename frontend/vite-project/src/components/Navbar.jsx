import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);

        // Skip admin for now in navbar UI
        if (parsedUser?.role === "user") {
          setLoggedInUser(parsedUser);
        } else {
          setLoggedInUser(null);
        }
      } catch (error) {
        setLoggedInUser(null);
      }
    } else {
      setLoggedInUser(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLoggedInUser(null);
    setShowDropdown(false);
    navigate("/");
  };

  const firstLetter =
    loggedInUser?.firstName?.charAt(0)?.toUpperCase() || "U";

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

        {!loggedInUser ? (
          <div className="navbar-auth">
            <Link to="/login" className="login-btn">
              Login
            </Link>
            <Link to="/register" className="signup-btn">
              Sign Up
            </Link>
          </div>
        ) : (
          <div className="profile-menu" ref={dropdownRef}>
            <button
              className="profile-circle"
              onClick={() => setShowDropdown((prev) => !prev)}
            >
              {firstLetter}
            </button>

            {showDropdown && (
              <div className="profile-dropdown">
                <p className="profile-name">
                  {loggedInUser.firstName} {loggedInUser.lastName}
                </p>

                <Link
                  to="/user-dashboard"
                  className="dropdown-item"
                  onClick={() => setShowDropdown(false)}
                >
                  Dashboard
                </Link>

                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;