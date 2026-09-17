from datetime import date
from typing import Literal

from pydantic import BaseModel


class DonorProfileCreate(BaseModel):
    blood_group: Literal[
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-"
    ]

    city: str

    last_donation_date: date | None = None

    available: bool = True


class AvailabilityUpdate(BaseModel):
    available: bool