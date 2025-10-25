import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import HomeContent from "./pages/HomeContent";
import Flights from "./pages/Flights";
import Bookings from "./pages/Bookings";
// Payments page removed as requested
import SeatSelection from "./pages/SeatSelection";
import Profile from "./pages/Profile"; // <-- IMPORT PROFILE

// Import the toast components
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      {/* ToastContainer for modern notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/home" element={<Home />}>
          <Route index element={<HomeContent />} />
          <Route path="flights" element={<Flights />} />
          <Route path="flights/:flightId/seats" element={<SeatSelection />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="profile" element={<Profile />} /> {/* <-- ADDED PROFILE ROUTE */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

