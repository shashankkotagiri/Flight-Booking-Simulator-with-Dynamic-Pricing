# Flight Booking Simulator with Dynamic Pricing

## Overview
Flight Booking Simulator with Dynamic Pricing is a full-stack web application that replicates a real-world flight booking system. It includes a Django REST Framework backend and a React frontend, offering a complete booking experience.

The project’s key feature is its Dynamic Pricing Engine, which adjusts flight prices automatically based on seat availability and the time remaining until departure.

## Features

### Backend (Django REST Framework)
- User Authentication: Secure signup and login endpoints.
- Flight Search API: Search flights by origin, destination, and date.
- Dynamic Sorting: Sort search results by price or duration.
- Dynamic Pricing Engine: Real-time price updates based on:
  - Percentage of seats already booked.
  - Days remaining until departure.
- Concurrency-Safe Bookings: Prevents multiple users from booking the same seat using @transaction.atomic and select_for_update().
- Booking Management: View and cancel user bookings.
- User Profile: Retrieve logged-in user details.
- Payment Integration: Razorpay backend order creation for payment handling.

### Frontend (React)
- Full User Flow: From signup/login to booking and viewing history.
- Multi-Page Interface: Built with React Router (Home, Flights, Bookings, Profile).
- Flight Search: Interactive flight search with sorting options.
- Seat Selection: Graphical seat picker for each flight.
- Real-Time Price Consistency: Re-fetches updated price before confirming booking.
- My Bookings Page: Displays user’s bookings.
- Profile Page: Shows user info and logout option.
- PDF Receipt Generation: Generates receipts using jsPDF and jspdf-autotable.
- Modern Notifications: Non-blocking toasts using react-toastify.

## Tech Stack
Backend: Python, Django, Django REST Framework, MySQL
Frontend: React.js, JavaScript (ES6+), React Router, Axios, CSS
PDF Generation: jsPDF, jspdf-autotable
Notifications: react-toastify
Payments: Razorpay

## Setup and Installation

### Backend Setup
1. Clone the repository and navigate to the backend folder.
2. Create a virtual environment:
   python -m venv venv
3. Activate the environment:
   - Windows: venv\Scripts\activate
   - Linux/Mac: source venv/bin/activate
4. Install dependencies:
   pip install Django djangorestframework mysqlclient djangocorsheaders razorpay
5. Create a MySQL database (e.g., flight_booking_db) and update your credentials in flight_booking_backend/settings.py.
6. Add your Razorpay API keys (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) in settings.py.
7. Run migrations:
   python manage.py migrate
8. Start the server:
   python manage.py runserver
   (Server runs at http://127.0.0.1:8000)

### Frontend Setup
1. Navigate to the frontend folder:
   cd flight-booking-frontend
2. Install dependencies:
   npm install
3. Install required libraries:
   npm install jspdf jspdf-autotable react-toastify
4. Run the development server:
   npm start
   (Runs at http://localhost:3000)

## Key API Endpoints
POST /api/signup/ : Create a new user.
POST /api/login/ : Log in a user.
GET /api/users/<id>/ : Fetch user profile.
GET /api/flights/ : Search for flights.
GET /api/flights/<id>/ : Get flight details.
GET /api/flights/<flight_id>/seats/ : Get all seats for a flight.
POST /api/flights/<flight_id>/seats/book/ : Book one or more seats.
GET /api/users/<user_id>/bookings/ : Get all bookings for a user.
GET /api/bookings/<id>/ : Get booking details.
POST /api/bookings/<id>/cancel/ : Cancel a booking.
POST /api/bookings/<id>/create-razorpay-order/ : Create Razorpay payment order.

## License
This project is licensed under the MIT License — see the LICENSE file for details.

## Contributors
- Shashank Kotagiri
