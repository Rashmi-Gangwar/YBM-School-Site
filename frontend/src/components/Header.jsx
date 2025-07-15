import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaYoutube, FaEnvelope } from "react-icons/fa";
import "./Header.css";
import schoolLogo from "../assets/react.svg";

const Header = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="main-header">
      <div className="top-header">
        <div className="logo-container">
          <img src={schoolLogo} alt="School Logo" className="school-logo" />
          <div className="school-name">
            <h2>YBM International School Site</h2>
            <p>YBM International School</p>
          </div>
        </div>

        <div className="top-right">
          <div className="social-icons nav-icons">
            <FaFacebookF />
            <FaTwitter />
            <FaYoutube />
            <FaEnvelope />
          </div>
        </div>

        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <div />
          <div />
          <div />
        </div>
      </div>

      <nav className={`main-nav ${menuOpen ? "open" : ""}`}>
        <ul className="nav-list">
          <li onClick={() => navigate("/")}>Home</li>
          <li onClick={() => navigate("/about")}>About Us</li>
          <li onClick={() => navigate("/lifeatYBM")}>Life at YBM</li>
          <li onClick={() => navigate("/events")}>News & Events</li>
          <li onClick={() => navigate("/register")}>Contact Us</li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
