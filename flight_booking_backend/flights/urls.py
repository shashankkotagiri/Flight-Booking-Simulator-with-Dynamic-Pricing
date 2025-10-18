# flights/urls.py
from django.urls import path
from .views import (
    SignupView, LoginView, AirlineListView,
    FlightListView, FlightDetailView, SeatListView,
    SeatBookingView, BookingCreateView, UserBookingsView,
    BookingDetailView, BookingCancelView, PaymentCreateView,
    PaymentListView
)

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),

    path('airlines/', AirlineListView.as_view(), name='airline-list'),

    path('flights/', FlightListView.as_view(), name='flight-list'),
    path('flights/<int:id>/', FlightDetailView.as_view(), name='flight-detail'),

    path('flights/<int:flight_id>/seats/', SeatListView.as_view(), name='seat-list'),
    path('flights/<int:flight_id>/seats/book/', SeatBookingView.as_view(), name='seat-book'),

    path('flights/<int:flight_id>/book/', BookingCreateView.as_view(), name='create-booking'),

    path('users/<int:user_id>/bookings/', UserBookingsView.as_view(), name='user-bookings'),
    path('bookings/<int:id>/', BookingDetailView.as_view(), name='booking-detail'),
    path('bookings/<int:booking_id>/cancel/', BookingCancelView.as_view(), name='booking-cancel'),

    path('bookings/<int:booking_id>/payment/', PaymentCreateView.as_view(), name='create-payment'),
    path('payments/', PaymentListView.as_view(), name='payment-list'),
]
