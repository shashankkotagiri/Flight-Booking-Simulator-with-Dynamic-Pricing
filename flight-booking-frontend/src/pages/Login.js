import React, { useState } from "react";
import { Link } from "react-router-dom"; 
import "./Login.css";
import api from "../api";
import flightImage from "../assets/flight.jpg";
import { toast } from "react-toastify";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/login/", { email, password });
      console.log("Login successful:", res.data);
      localStorage.setItem("user_id", res.data.user_id);


      toast.success("Login successful! Redirecting...");

     
      setTimeout(() => {
        window.location.href = "/home";
      }, 1500); 

    } catch (err) {
      console.error("Login failed:", err);
      
      toast.error("Invalid credentials!");
    }
  };

  return (
    <div className="login-container">
      <div className="red-bg-overlay"></div>
      <div className="login-wrapper">
        <img src={flightImage} alt="Flight" className="flight-bg-big" />

        <div className="login-card">
          <h1>Welcome Back</h1>
          <p>Login to continue ✈️</p>
          <form onSubmit={handleLogin}>
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
            <button type="submit">Login</button>
          </form>
          <p className="register-link">
            Don’t have an account? <Link to="/signup">Register Now</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

