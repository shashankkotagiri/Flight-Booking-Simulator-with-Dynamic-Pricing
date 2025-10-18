# flights/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Flight, Seat

@receiver(post_save, sender=Flight)
def create_seats_for_flight(sender, instance, created, **kwargs):
    # Create seats only when flight is created and seats don't exist
    if created:
        seats = []
        # We'll create rows of 6 (A-F). Map numbers to rows.
        cols = ['A','B','C','D','E','F']
        total = instance.total_seats
        row = 1
        created_count = 0
        while created_count < total:
            for col in cols:
                if created_count >= total:
                    break
                seat_number = f"{row}{col}"
                seats.append(Seat(flight=instance, seat_number=seat_number))
                created_count += 1
            row += 1
        Seat.objects.bulk_create(seats)
