import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../api";
import "./SeatSelection.css";

function SeatSelection() {
  const { flightId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // const flightFromState = location.state?.flight || null; // <-- This was the problem (stale data)

  // --- FIX: Start with null and add a loading state ---
  const [flight, setFlight] = useState(null); // <-- Start as null
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true); // <-- Use a single loading state
  // --- End Fix ---

  const [numSeats, setNumSeats] = useState(1);
  const [selected, setSelected] = useState([]);
  

  // 🛫 Fetch flight and seats when component mounts
  useEffect(() => {
    const fetchFlightAndSeats = async () => {
      try {
        setLoading(true); // Ensure loading is true at the start

        // 1. Fetch REAL, up-to-date flight data
        const flightRes = await api.get(`/flights/${flightId}/`);
        setFlight(flightRes.data); // <-- This will have the correct, current price

        // 2. Fetch seats
        const seatRes = await api.get(`/flights/${flightId}/seats/`);
        const sorted = [...seatRes.data].sort(
          (a, b) => Number(a.seat_number) - Number(b.seat_number)
        );
        setSeats(sorted);

      } catch (err) {
        console.error("Error fetching flight/seats:", err);
      } finally {
        setLoading(false); // <-- Stop loading once all data is fetched
      }
    };

    fetchFlightAndSeats();
  }, [flightId]);

  // 🎫 Toggle seat selection
  const toggleSeat = (seat) => {
    if (seat.is_booked) return;
    if (selected.includes(seat.seat_number)) {
      setSelected(selected.filter((s) => s !== seat.seat_number));
    } else {
      if (selected.length >= numSeats) {
        alert(`⚠ You can select up to ${numSeats} seats`);
        return;
      }
      setSelected([...selected, seat.seat_number]);
    }
  };

  // 💳 Handle confirm and payment
  const handleConfirm = async () => {
    if (selected.length === 0) {
      alert("⚠ Please select at least one seat");
      return;
    }

    const userId = localStorage.getItem("user_id");
    if (!userId) {
        alert("Please log in to book a flight.");
        navigate("/login");
        return;
    }

    try {
      // 1️⃣ Create booking
      const payload = { user_id: userId, seat_numbers: selected };
      const res = await api.post(`/flights/${flightId}/seats/book/`, payload);

      const bookingId = res.data.id;
      const pnr = res.data.pnr || res.data.id;

      // 2️⃣ Create Razorpay order
      const orderRes = await api.post(
        `/bookings/${bookingId}/create-razorpay-order/`
      );
      const { order_id, amount, currency, key } = orderRes.data;

      // 3️⃣ Open Razorpay payment popup
      const options = {
        key: key,
        amount: amount, // This 'amount' comes from the backend booking
        currency: currency,
        name: "Flight Booking",
        description: `PNR: ${pnr}`,
        order_id: order_id,
        // --- THIS IS THE UPDATED HANDLER ---
        handler: async function (response) {
          // alert("✅ Payment Successful!"); // <-- 1. REMOVED ALERT
          
          // 2. Navigate with a success message in the state
          navigate("/home/bookings", { 
            state: { 
              successMessage: `Booking Confirmed! Your PNR is ${pnr}.` 
            } 
          });
        },
        // --- END OF UPDATE ---
        prefill: {
          name: "Passenger",
          email: "test@example.com",
          contact: "9999999999",
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Booking or Payment failed:", err);
      alert(err.response?.data?.error || "Booking failed");
      // 🧭 refresh seat availability after error
      const seatRes = await api.get(`/flights/${flightId}/seats/`);
      setSeats(seatRes.data);
    }
  };

  // 🪑 Arrange seats into rows
  const rows = {};
  seats.forEach((s, index) => {
    const rowNo = Math.floor(index / 6) + 1;
    if (!rows[rowNo]) rows[rowNo] = [];
    rows[rowNo].push(s);
  });
  const sortedRowKeys = Object.keys(rows).sort((a, b) => Number(a) - Number(b));

  // This price is now based on the *fetched* flight data, not the stale data
  const totalPrice = (selected.length * (flight?.dynamic_price || 0)).toFixed(2);

  // --- FIX: Show a loading screen until the *real* price is loaded ---
  if (loading) {
    return (
        <div className="seat-page">
            <div className="seat-card">
                <h2>Loading flight details and seats...</h2>
            </div>
        </div>
    );
  }
  // --- End Fix ---


  return (
    <div className="seat-page">
      <div className="seat-card">
        <h2>
          Seat Selection — {flight?.flight_number} ({flight?.source} →{" "}
          {flight?.destination})
        </h2>

        <div className="seat-meta">
          <label>Seats to book:</label>
          <input
            type="number"
            min="1"
            max={flight?.available_seats || 1}
            value={numSeats}
            onChange={(e) =>
              setNumSeats(
                Math.max(
                  1,
                  Math.min(Number(e.target.value), flight?.available_seats || 1)
                )
              )
            }
          />
          <span className="available">
            Available: {flight?.available_seats || 0}
          </span>
          <span className="price">Total: ₹{totalPrice}</span>
        </div>

        <div className="seat-layout">
          {sortedRowKeys.map((rowKey) => {
            const rowSeats = rows[rowKey];
            const left = rowSeats.slice(0, 3);
            const right = rowSeats.slice(3, 6);

            return (
              <div key={rowKey} className="seat-row">
                <div className="seat-subrow">
                  {left.map((s) => (
                    <div
                      key={s.id}
                      className={`seat-cell ${
                        s.is_booked
                          ? "booked"
                          : selected.includes(s.seat_number)
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => toggleSeat(s)}
                    >
                      {s.seat_number.padStart(2, "0")}
                    </div>
                  ))}
                </div>
                <div className="aisle" />
                <div className="seat-subrow">
                  {right.map((s) => (
                    <div
                      key={s.id}
                      className={`seat-cell ${
                        s.is_booked
                          ? "booked"
                          : selected.includes(s.seat_number)
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => toggleSeat(s)}
                    >
                      {s.seat_number.padStart(2, "0")}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="seat-actions">
          <button onClick={() => navigate(-1)} className="back-btn">
            ⬅ Back
          </button>
          <button
            onClick={handleConfirm}
            className="confirm-btn"
            disabled={selected.length === 0}
            style={{ opacity: selected.length === 0 ? 0.6 : 1 }}
          >
            Confirm & Pay
          </button>
        </div>
      </div>
    </div>
  );
}

export default SeatSelection;