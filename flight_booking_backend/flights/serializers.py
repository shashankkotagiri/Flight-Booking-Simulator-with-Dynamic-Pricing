# flights/serializers.py
from rest_framework import serializers
from .models import User, Airline, Flight, Booking, Seat, Payment

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role', 'created_at']

class AirlineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Airline
        fields = ['id', 'name', 'code', 'country', 'created_at']

class FlightSerializer(serializers.ModelSerializer):
    airline = AirlineSerializer(read_only=True)
    dynamic_price = serializers.SerializerMethodField()

    class Meta:
        model = Flight
        fields = [
            'id', 'airline', 'flight_number', 'source', 'destination',
            'departure_datetime', 'arrival_datetime', 'total_seats',
            'available_seats', 'base_price', 'duration_minutes', 'dynamic_price', 'created_at'
        ]

    def get_dynamic_price(self, obj):
        return obj.dynamic_price()

class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = ['id', 'flight', 'seat_number', 'is_booked']

class BookingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    flight = FlightSerializer(read_only=True)
    seats = SeatSerializer(many=True, read_only=True, source='seat_set')

    class Meta:
        model = Booking
        fields = [
            'id', 'pnr', 'user', 'flight', 'seats', 'seats_booked',
            'price_per_ticket', 'total_price', 'status', 'cancelled_at', 'booking_time'
        ]

class PaymentSerializer(serializers.ModelSerializer):
    booking = BookingSerializer(read_only=True)
    class Meta:
        model = Payment
        fields = ['id','booking','amount','payment_method','payment_status','payment_time']
