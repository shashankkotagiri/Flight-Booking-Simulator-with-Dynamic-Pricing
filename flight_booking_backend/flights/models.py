# flights/models.py
from django.db import models
from datetime import datetime, timezone
import uuid

# -------------------- User Model --------------------
class User(models.Model):
    ROLE_CHOICES = (
        ('user', 'User'),
        ('admin', 'Admin'),
    )
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True, max_length=150)
    password_hash = models.CharField(max_length=255)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# -------------------- Airline Model --------------------
class Airline(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.code})"


# -------------------- Flight Model --------------------
class Flight(models.Model):
    airline = models.ForeignKey(Airline, on_delete=models.CASCADE, default=1, related_name='flights')
    flight_number = models.CharField(max_length=20)
    source = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    departure_datetime = models.DateTimeField()
    arrival_datetime = models.DateTimeField(null=True, blank=True)
    total_seats = models.IntegerField()
    available_seats = models.IntegerField()
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_minutes = models.IntegerField(null=True, blank=True)  # NEW: flight duration in minutes
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.flight_number} - {self.source} to {self.destination}"

    def dynamic_price(self, booking_date=None):
        price = float(self.base_price)
        
        # NOTE: We use the *database* value for available_seats for this calculation
        booked_seats = self.total_seats - self.available_seats 
        booking_ratio = booked_seats / self.total_seats if self.total_seats > 0 else 0

        # Seat-based pricing
        if booking_ratio >= 0.8:
            price *= 1.5
        elif booking_ratio >= 0.5:
            price *= 1.2
        elif self.available_seats / self.total_seats > 0.7:
            price *= 0.9

        # Time-based pricing
        if booking_date:
            days_before = (self.departure_datetime.date() - booking_date.date()).days
            if days_before > 30:
                price *= 0.85
            elif days_before <= 3:
                price *= 1.25

        return round(price, 2)


# -------------------- Booking Model --------------------
class Booking(models.Model):
    STATUS_CHOICES = (
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    flight = models.ForeignKey(Flight, on_delete=models.CASCADE)
    seats_booked = models.IntegerField()
    price_per_ticket = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    booking_time = models.DateTimeField(auto_now_add=True)

    # NEW fields
    pnr = models.CharField(max_length=20, unique=True, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='CONFIRMED')
    cancelled_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        # --- PRICE LOGIC REMOVED ---
        # The price is now set by the View to prevent recalculation.

        # Generate PNR if missing
        if not self.pnr:
            # simple PNR generator: 8 chars from uuid
            self.pnr = uuid.uuid4().hex[:8].upper()

        # NOTE: The logic to reduce flight.available_seats
        # has been moved to the SeatBookingView's transaction
        # to prevent race conditions.
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Booking {self.id} - {self.pnr} by {self.user.name}"


# -------------------- Seat Model --------------------
class Seat(models.Model):
    flight = models.ForeignKey(Flight, on_delete=models.CASCADE, related_name='seats')
    seat_number = models.CharField(max_length=10)
    is_booked = models.BooleanField(default=False)
    booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        unique_together = ('flight', 'seat_number')

    def __str__(self):
        return f"{self.flight.flight_number} - Seat {self.seat_number}"


# -------------------- Payment Model --------------------
class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = (
        ('credit_card', 'Credit Card'),
        ('debit_card', 'Debit Card'),
        ('upi', 'UPI'),
        ('net_banking', 'Net Banking'),
    )
    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
    )

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    transaction_id = models.CharField(max_length=100, unique=True)
    payment_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment {self.id} - {self.payment_status}"

