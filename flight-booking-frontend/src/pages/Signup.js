import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Signup.css";
import api from "../api";
import flightImage from "../assets/flight.jpg";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/signup/", { name, email, password });
      console.log("Signup successful:", res.data);
      alert("Account created successfully!");

    } catch (err) {
      console.error("Signup failed:", err);
      alert("Failed to create account!");
    }
  };

  return (
    <div className="signup-container">
      <div className="red-bg-overlay"></div>
      <div className="signup-wrapper">
        <img src={flightImage} alt="Flight" className="flight-bg-big" />

        <div className="signup-card">
          <h1>Create Account</h1>
          <p>Start your journey with us ✈️</p>
          <form onSubmit={handleSignup}>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Sign Up</button>
          </form>
          <p className="login-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
