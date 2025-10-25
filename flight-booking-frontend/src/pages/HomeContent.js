import React from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import flightImg from "../assets/flight.jpg"; // your background image

const HomeContent = () => {
  const navigate = useNavigate();

  return (
    <div className="home-bg">
      <div className="overlay">
        <div className="welcome-box">
          <h1 className="welcome-heading">✈ Welcome to Flight Booker</h1>
          <p className="welcome-text">
            Discover the world with comfort, safety, and speed. Your next adventure starts here.
          </p>
          <button className="book-btn" onClick={() => navigate("/home/flights")}>
            Book a Flight
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeContent;
