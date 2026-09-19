from datetime import date

from pydantic import BaseModel, ConfigDict


# ============================================================
# CREATE DONOR PROFILE
# ============================================================

class DonorProfileCreate(BaseModel):
    blood_group: str
    city: str

    # Location coordinates for distance-based matching
    latitude: float | None = None
    longitude: float | None = None

    last_donation_date: date | None = None
    available: bool = True


# ============================================================
# UPDATE DONOR AVAILABILITY
# ============================================================

class DonorAvailabilityUpdate(BaseModel):
    available: bool


# ============================================================
# DONOR PROFILE RESPONSE
# ============================================================

class DonorProfileResponse(BaseModel):
    id: int
    user_id: int
    blood_group: str
    city: str

    latitude: float | None = None
    longitude: float | None = None

    last_donation_date: date | None = None
    available: bool

    model_config = ConfigDict(from_attributes=True)