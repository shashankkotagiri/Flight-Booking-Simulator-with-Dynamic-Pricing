# flights/views.py
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password
from .models import User, Airline, Flight, Booking, Seat, Payment
from .serializers import (
    UserSerializer, AirlineSerializer, FlightSerializer,
    BookingSerializer, SeatSerializer, PaymentSerializer
)
from datetime import datetime

# -------------------- Authentication --------------------
class SignupView(APIView):
    def post(self, request):
        name = request.data.get('name')
        email = request.data.get('email')
        password = request.data.get('password')

        if not name or not email or not password:
            return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create(
            name=name,
            email=email,
            password_hash=make_password(password)
        )
        return Response({'message': 'Signup successful', 'user_id': user.id, 'role': user.role}, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Email and password required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            if check_password(password, user.password_hash):
                return Response({'message': 'Login successful', 'user_id': user.id, 'role': user.role}, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Invalid password'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

# -------------------- Users --------------------
class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'id'

# -------------------- Airlines --------------------
class AirlineListView(generics.ListAPIView):
    queryset = Airline.objects.all()
    serializer_class = AirlineSerializer

class AirlineDetailView(generics.RetrieveAPIView):
    queryset = Airline.objects.all()
    serializer_class = AirlineSerializer
    lookup_field = 'id'

# -------------------- Flights --------------------
class FlightListView(generics.ListAPIView):
    serializer_class = FlightSerializer

    def get_queryset(self):
        source = self.request.query_params.get('source')
        destination = self.request.query_params.get('destination')
        date = self.request.query_params.get('date')  # YYYY-MM-DD
        sort = self.request.query_params.get('sort')  # price_asc, price_desc, duration_asc, duration_desc

        queryset = Flight.objects.all()

        if source:
            queryset = queryset.filter(source__iexact=source)
        if destination:
            queryset = queryset.filter(destination__iexact=destination)
        if date:
            # filter flights whose departure date equals the provided date
            try:
                dt = datetime.fromisoformat(date)
                start = datetime(dt.year, dt.month, dt.day)
                end = start.replace(hour=23, minute=59, second=59)
                queryset = queryset.filter(departure_datetime__range=(start, end))
            except Exception:
                pass

        # Sorting
        if sort == 'price_asc':
            # note: dynamic price computed in serializer; we can sort by base_price as approximation
            queryset = queryset.order_by('base_price')
        elif sort == 'price_desc':
            queryset = queryset.order_by('-base_price')
        elif sort == 'duration_asc':
            queryset = queryset.order_by('duration_minutes')
        elif sort == 'duration_desc':
            queryset = queryset.order_by('-duration_minutes')
        else:
            queryset = queryset.order_by('departure_datetime')

        return queryset

class FlightDetailView(generics.RetrieveAPIView):
    queryset = Flight.objects.all()
    serializer_class = FlightSerializer
    lookup_field = 'id'

# -------------------- Seats --------------------
class SeatListView(generics.ListAPIView):
    serializer_class = SeatSerializer

    def get_queryset(self):
        flight_id = self.kwargs['flight_id']
        return Seat.objects.filter(flight_id=flight_id).order_by('seat_number')

# -------------------- Seat booking (single seat selection endpoint) --------------------
class SeatBookingView(APIView):
    """
    POST /api/flights/<flight_id>/seats/book/
    payload: { "user_id": 2, "seat_numbers": ["1A","1B"] }
    """
    @transaction.atomic
    def post(self, request, flight_id):
        flight = get_object_or_404(Flight, id=flight_id)
        user_id = request.data.get("user_id")
        seat_numbers = request.data.get("seat_numbers", [])

        if not user_id or not seat_numbers:
            return Response({"error": "user_id and seat_numbers required"}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(User, id=user_id)

        # Lock selected seat rows (SELECT ... FOR UPDATE) by fetching them inside a transaction
        seats_qs = Seat.objects.select_for_update().filter(flight=flight, seat_number__in=seat_numbers)
        seats = list(seats_qs)

        if len(seats) != len(seat_numbers):
            return Response({"error": "Some seats not found for this flight"}, status=status.HTTP_400_BAD_REQUEST)

        # ensure none is already booked
        for s in seats:
            if s.is_booked:
                return Response({"error": f"Seat {s.seat_number} already booked"}, status=status.HTTP_400_BAD_REQUEST)

        seats_booked = len(seats)
        if seats_booked > flight.available_seats:
            return Response({"error": "Not enough seats available"}, status=status.HTTP_400_BAD_REQUEST)

        # Create booking
        price_per_ticket = flight.dynamic_price(datetime.now())
        total_price = price_per_ticket * seats_booked

        booking = Booking.objects.create(
            user=user,
            flight=flight,
            seats_booked=seats_booked,
            price_per_ticket=price_per_ticket,
            total_price=total_price
        )

        # Mark seats booked and link to booking
        for s in seats:
            s.is_booked = True
            s.booking = booking
            s.save()

        # update flight available seats
        flight.available_seats = max(0, flight.available_seats - seats_booked)
        flight.save()

        serializer = BookingSerializer(booking)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# -------------------- Bookings (generic create still kept) --------------------
class BookingCreateView(APIView):
    @transaction.atomic
    def post(self, request, flight_id):
        # This endpoint accepts seat_ids or will pick arbitrary seats if seat_ids not provided.
        flight = get_object_or_404(Flight, id=flight_id)
        user_id = request.data.get("user_id")
        seat_numbers = request.data.get("seat_numbers", [])  # prefer seat_numbers

        user = get_object_or_404(User, id=user_id)

        if seat_numbers:
            # delegate to SeatBookingView logic
            request.data['seat_numbers'] = seat_numbers
            return SeatBookingView().post(request, flight_id)
        else:
            seats_book = int(request.data.get("seats_booked", 1))
            # find available seats
            seats_qs = Seat.objects.select_for_update().filter(flight=flight, is_booked=False)[:seats_book]
            seats = list(seats_qs)
            if len(seats) != seats_book:
                return Response({"error": "Not enough available seats"}, status=status.HTTP_400_BAD_REQUEST)

            # booking creation
            price_per_ticket = flight.dynamic_price(datetime.now())
            total_price = price_per_ticket * seats_book

            booking = Booking.objects.create(
                user=user,
                flight=flight,
                seats_booked=seats_book,
                price_per_ticket=price_per_ticket,
                total_price=total_price
            )

            for s in seats:
                s.is_booked = True
                s.booking = booking
                s.save()

            flight.available_seats = max(0, flight.available_seats - seats_book)
            flight.save()

            serializer = BookingSerializer(booking)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

class UserBookingsView(generics.ListAPIView):
    serializer_class = BookingSerializer
    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return Booking.objects.filter(user_id=user_id).order_by('-booking_time')

class BookingDetailView(generics.RetrieveAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    lookup_field = 'id'

# -------------------- Booking cancellation --------------------
class BookingCancelView(APIView):
    @transaction.atomic
    def post(self, request, booking_id):
        booking = get_object_or_404(Booking, id=booking_id)
        if booking.status == 'CANCELLED':
            return Response({"error": "Booking already cancelled"}, status=status.HTTP_400_BAD_REQUEST)

        # free seats
        seats = Seat.objects.select_for_update().filter(booking=booking)
        count = 0
        for s in seats:
            s.is_booked = False
            s.booking = None
            s.save()
            count += 1

        # adjust flight availability
        booking.flight.available_seats = booking.flight.available_seats + count
        booking.flight.save()

        booking.status = 'CANCELLED'
        booking.cancelled_at = timezone.now()
        booking.save()

        return Response({"message": "Booking cancelled", "pnr": booking.pnr}, status=status.HTTP_200_OK)

# -------------------- Payments --------------------
class PaymentCreateView(APIView):
    def post(self, request, booking_id):
        booking = get_object_or_404(Booking, id=booking_id)
        amount = booking.total_price
        payment_method = request.data.get("payment_method", "credit_card")

        # Simulate transaction id
        txn = f"TXN{int(datetime.now().timestamp())}"

        payment = Payment.objects.create(
            booking=booking,
            amount=amount,
            payment_method=payment_method,
            payment_status="success",
            transaction_id=txn
        )

        serializer = PaymentSerializer(payment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class PaymentListView(generics.ListAPIView):
    queryset = Payment.objects.all().order_by('-payment_time')
    serializer_class = PaymentSerializer

class PaymentDetailView(generics.RetrieveAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    lookup_field = 'id'
