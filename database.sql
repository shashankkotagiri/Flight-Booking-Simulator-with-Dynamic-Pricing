CREATE DATABASE flight_booking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'flight_user'@'localhost' IDENTIFIED BY 'StrongPass123!';
GRANT ALL PRIVILEGES ON flight_booking_db.* TO 'flight_user'@'localhost';
FLUSH PRIVILEGES;

USE flight_booking_db;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user','admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE flights (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    flight_number VARCHAR(20) NOT NULL,
    source VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    departure_datetime DATETIME NOT NULL,
    arrival_datetime DATETIME,
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    airline_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_route_date (source, destination, departure_datetime)
);
CREATE TABLE bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    flight_id BIGINT NOT NULL,
    seats_booked INT NOT NULL,
    price_per_ticket DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    seat_numbers VARCHAR(100) NULL,
    booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE CASCADE
);
CREATE TABLE airlines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('credit_card','debit_card','upi','net_banking') NOT NULL,
    payment_status ENUM('pending','success','failed') NOT NULL DEFAULT 'pending',
    transaction_id VARCHAR(100) UNIQUE,
    payment_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);
CREATE TABLE seats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    flight_id BIGINT NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    booking_id BIGINT,
    FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);
-- Users
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin User', 'admin@example.com', '$2b$12$adminhash', 'admin'),
('Test User1', 'user1@example.com', '$2b$12$user1hash', 'user'),
('Test User2', 'user2@example.com', '$2b$12$user2hash', 'user');

-- Airlines
INSERT INTO airlines (name, code, country) VALUES
('IndiGo', '6E', 'India'),
('Air India', 'AI', 'India'),
('Vistara', 'UK', 'India'),
('SpiceJet', 'SG', 'India'),
('Go First', 'G8', 'India');

-- Flights
INSERT INTO flights (flight_number, source, destination, departure_datetime, arrival_datetime, total_seats, available_seats, base_price, airline_id) VALUES
('AI101', 'Hyderabad', 'Bengaluru', '2025-10-10 08:00:00', '2025-10-10 09:30:00', 150, 150, 3500.00, 2),
('6E202', 'Hyderabad', 'Delhi', '2025-10-11 06:30:00', '2025-10-11 09:30:00', 180, 180, 5500.00, 1),
('UK303', 'Bengaluru', 'Mumbai', '2025-10-09 14:00:00', '2025-10-09 15:30:00', 160, 160, 3200.00, 3),
('AI404', 'Delhi', 'Hyderabad', '2025-10-12 07:00:00', '2025-10-12 10:00:00', 200, 200, 6000.00, 2),
('6E505', 'Mumbai', 'Bengaluru', '2025-10-13 12:00:00', '2025-10-13 13:30:00', 150, 150, 4000.00, 1);

-- Bookings
INSERT INTO bookings (user_id, flight_id, seats_booked, price_per_ticket, total_price) VALUES
(2, 1, 2, 3500.00, 7000.00),
(3, 3, 1, 3200.00, 3200.00);

-- Payments
INSERT INTO payments (booking_id, amount, payment_method, payment_status, transaction_id) VALUES
(1, 7000.00, 'upi', 'success', 'TXN123456'),
(2, 3200.00, 'credit_card', 'success', 'TXN123457');

-- Seats for flight 1
INSERT INTO seats (flight_id, seat_number) VALUES
(1, '1A'),(1, '1B'),(1, '1C'),(1, '1D'),
(1, '2A'),(1, '2B'),(1, '2C'),(1, '2D');
