import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Flights.css";
import api from "../api";

function Flights() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ from: "", to: "", date: "" });
  const [flights, setFlights] = useState([]);
  const [message, setMessage] = useState("");
  const [sort, setSort] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const params = {};
      if (formData.from) params.source = formData.from;
      if (formData.to) params.destination = formData.to;
      if (formData.date) params.date = formData.date;
      if (sort) params.sort = sort;

      const res = await api.get("/flights/", { params });
      const data = res.data || [];
      if (data.length) {
        setFlights(data);
        setMessage("");
      } else {
        setFlights([]);
        setMessage("No flights available for this route.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error contacting server.");
    }
  };

  const handleGoToSeats = (flight) => {
    navigate(`/home/flights/${flight.id}/seats`, { state: { flight } });
  };

  return (
    <div className="flight-bg">
      <div className="flight-overlay">
        <div className="flight-card">
          <h1 className="flight-heading">Search Flights ✈️</h1>

          <form className="flight-form" onSubmit={handleSearch}>
            <div className="form-row">
              <div className="form-group">
                <label>From</label>
                <input
                  name="from"
                  value={formData.from}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>To</label>
                <input
                  name="to"
                  value={formData.to}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* --- THIS IS THE UPDATED DROPDOWN --- */}
              <div className="form-group">
                <label>Sort</label>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="">Sort by</option>
                  <option value="price_asc">Price (Low to High)</option>
                  <option value="price_desc">Price (High to Low)</option>
                  <option value="duration_asc">Duration (Shortest)</option>
                  <option value="duration_desc">Duration (Longest)</option>
                </select>
              </div>
              {/* --- END OF UPDATE --- */}
              
            </div>

            <button type="submit" className="search-btn">
              Search Flights
            </button>
          </form>

          <div className="flight-results">
            {message && <p className="no-flights">{message}</p>}
            {flights.map((f) => (
              <div className="flight-item" key={f.id}>
                <div className="flight-info">
                  <h3>
                    {f.airline.name} — {f.flight_number}
                  </h3>
                  <p>
                    {f.source} ✈ {f.destination}
                  </p>
                  <p>
                    Departure: {new Date(f.departure_datetime).toLocaleString()}
                  </p>
                  <p>
                    Duration:{" "}
                    {f.duration_minutes ? `${f.duration_minutes} min` : "N/A"}
                  </p>
                  <p>Price: ₹{f.dynamic_price}</p>
                </div>
                <button className="book-btn" onClick={() => handleGoToSeats(f)}>
                  Book Ticket
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Flights;
