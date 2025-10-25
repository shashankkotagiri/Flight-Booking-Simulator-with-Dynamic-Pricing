import React from "react";
import { Link } from "react-router-dom";
// Removed FaUserCircle as it's no longer used
import { FaPlaneDeparture } from "react-icons/fa"; 
import "./Navbar.css"; // Make sure you have this file

function Navbar() {
  // Logout button is removed from here and added to Profile.js

  return (
    <nav className="navbar">
      {/* Left side with icon and text */}
      <div className="navbar-left">
        <FaPlaneDeparture className="navbar-icon" />
        <span className="navbar-title">Flight Booker</span>
      </div>

      {/* Center menu links - Profile link is now here */}
      <div className="navbar-links">
        <Link to="/home" className="nav-link">
          Home
        </Link>
        <Link to="/home/flights" className="nav-link">
          Flights
        </Link>
        <Link to="/home/bookings" className="nav-link">
          My Bookings
        </Link>
        {/* --- THIS IS THE UPDATED LINK --- */}
        <Link to="/home/profile" className="nav-link">
          Profile
        </Link>
        {/* --- END OF UPDATE --- */}
      </div>

      {/* Right side is now empty, which is fine for this layout */}
      <div></div>
    </nav>
  );
}

export default Navbar;