import random
import string

def generate_pnr(length: int = 6) -> str:
    """Generate a short unique-ish PNR: uppercase letters + digits."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
