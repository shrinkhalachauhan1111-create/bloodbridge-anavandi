from typing import Optional

from pydantic import BaseModel


# =========================================================
# CREATE BLOOD REQUEST
# =========================================================

class BloodRequestCreate(BaseModel):
    blood_group: str
    units: int
    hospital_name: str
    city: str
    urgency: str = "urgent"

    # GPS coordinates
    latitude: Optional[float] = None
    longitude: Optional[float] = None


# =========================================================
# OPTIONAL RESPONSE SCHEMA
# =========================================================

class BloodRequestResponse(BaseModel):
    id: int
    requester_id: int
    blood_group: str
    units: int
    hospital_name: str
    city: str
    urgency: str
    status: str

    latitude: Optional[float] = None
    longitude: Optional[float] = None

    class Config:
        from_attributes = True