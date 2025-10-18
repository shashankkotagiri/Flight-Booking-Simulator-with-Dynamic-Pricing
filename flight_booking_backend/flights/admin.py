from django.contrib import admin
from .models import User, Airline, Flight, Seat, Booking, Payment

admin.site.register(User)
admin.site.register(Airline)
admin.site.register(Flight)
admin.site.register(Seat)
admin.site.register(Booking)
admin.site.register(Payment)
