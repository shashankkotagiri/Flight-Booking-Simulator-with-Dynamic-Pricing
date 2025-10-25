import React, { useEffect, useState, useCallback } from "react";
import "./Flights.css";
import api from "../api";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
// --- 1. IMPORT useLocation and useNavigate ---
import { useLocation, useNavigate } from "react-router-dom";

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const userId = localStorage.getItem("user_id");

  // --- 2. GET location and navigate ---
  const location = useLocation();
  const navigate = useNavigate();

  // --- 3. ADD useEffect to show toast on load ---
  useEffect(() => {
    if (location.state?.successMessage) {
      toast.success(location.state.successMessage);
      // Clear the state so message doesn't re-appear
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]); // Runs when location changes
  // --- END OF UPDATE ---


  const fetchBookings = useCallback(async () => {
    if (!userId) {
      console.log("No user ID found, clearing bookings.");
      setBookings([]);
      return;
    }
    try {
      const res = await api.get(`/users/${userId}/bookings/`);
      setBookings(res.data || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      toast.error("Could not fetch bookings.");
    }
  }, [userId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await api.post(`/bookings/${id}/cancel/`);
      toast.success("Booking cancelled successfully!");
      fetchBookings(); // Refresh the list
    } catch (err)
    {
      console.error("Cancel failed:", err);
      toast.error("Cancellation failed.");
    }
  };

  const handleDownloadPDF = (booking) => {
    const doc = new jsPDF();

    // Add Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Flight Booking Receipt", 105, 20, { align: "center" });
    

    // Add Booking Details (PNR, Status, etc.)
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    autoTable(doc, {
      startY: 30,
      head: [["Detail", "Value"]], 
      body: [
        ["PNR", booking.pnr],
        ["Status", booking.status],
        ["Booked On", new Date(booking.booking_time).toLocaleString()],
      ],
      theme: "striped",
      headStyles: { fillColor: [198, 40, 40] },
    });

    // Add Passenger Details
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10, 
      head: [["Detail", "Value"]], 
      body: [
        ["Name", booking.user.name],
        ["Email", booking.user.email],
      ],
      theme: "striped",
      headStyles: { fillColor: [198, 40, 40] },
    });

    // Flight Info Table
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10, 
      head: [["Airline", "Flight No.", "From", "To", "Departure", "Arrival"]],
      body: [
        [
          booking.flight.airline.name,
          booking.flight.flight_number,
          booking.flight.source,
          booking.flight.destination,
          new Date(booking.flight.departure_datetime).toLocaleString(),
          new Date(booking.flight.arrival_datetime).toLocaleString(),
        ],
      ],
      theme: "striped",
      headStyles: { fillColor: [198, 40, 40] },
    });

    // Passenger/Seat Info Table
    const seatData = booking.seats.map((seat) => [seat.seat_number]);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10, 
      head: [["Booked Seat(s)"]],
      body: seatData.length > 0 ? seatData : [["No seats listed"]],
      headStyles: { fillColor: [198, 40, 40] },
      theme: "striped",
    });

    // Pricing Details
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10, 
      head: [["Item", "Amount"]], 
      body: [
        ["Total Seats", booking.seats_booked],
        ["Price Per Ticket", `INR ${booking.price_per_ticket}`],
        ["Total Price", `INR ${booking.total_price}`],
      ],
      theme: "striped",
      headStyles: { fillColor: [198, 40, 40] },
    });

    // Save the PDF
    doc.save(`Booking-Receipt-${booking.pnr}.pdf`);
    toast.success("Receipt downloaded!");
  };

  return (
    <div className="flight-bg">
      <div className="flight-overlay">
        <div className="flight-card">
          <h1 className="flight-heading">MY BOOKINGS</h1>

          <div className="flight-results">
            {bookings.length === 0 && (
              <p className="no-flights">No bookings found</p>
            )}

            {bookings.map((b) => (
              <div className="flight-item" key={b.id}>
                <div className="flight-info">
                  <h3>
                    {b.flight.airline?.name} — {b.flight.flight_number}
                  </h3>
                  <p>
                    {b.flight.source} ✈ {b.flight.destination}
                  </p>
                  <p>
                    Departure:{" "}
                    {new Date(b.flight.departure_datetime).toLocaleString()}
                  </p>

                  <p>
                    Seats: {b.seats.map((seat) => seat.seat_number).join(", ")}
                  </p>
                  <p>Price: ₹{b.total_price}</p>
                  <p>
                    PNR: <strong>{b.pnr}</strong>
                  </p>
                </div>

                <div className="booking-buttons">
                  {b.status === "CONFIRMED" ? (
                    <button
                      className="book-btn cancel-btn"
                      onClick={() => handleCancel(b.id)}
                    >
                      Cancel Ticket
                    </button>
                  ) : (
                    <span className="booking-status-cancelled">
                      Cancelled ❌
                    </span>
                  )}
                  <button
                    className="book-btn download-btn"
                    onClick={() => handleDownloadPDF(b)}
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Bookings;