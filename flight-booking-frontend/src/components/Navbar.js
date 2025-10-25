import React from "react";
import { Link } from "react-router-dom";
import { FaPlaneDeparture } from "react-icons/fa"; 
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <FaPlaneDeparture className="navbar-icon" />
        <span className="navbar-title">Flight Booker</span>
      </div>
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
        <Link to="/home/profile" className="nav-link">
          Profile
        </Link>
      </div>
      <div></div>
    </nav>
  );
}

export default Navbar;