from datetime import date
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from pydantic import BaseModel

from sqlalchemy.orm import Session

from database import get_db

from models.user import User
from models.donor import DonorProfile
from models.blood_request import BloodRequest
from models.match import Match

from services.matching import calculate_distance

from utils.dependencies import get_current_user


router = APIRouter(
    prefix="/donors",
    tags=["Donors"]
)


# =========================================================
# PAYLOAD
# =========================================================

class DonorProfilePayload(BaseModel):

    blood_group: str

    city: str

    latitude: Optional[float] = None

    longitude: Optional[float] = None

    last_donation_date: Optional[date] = None

    available: bool = True


# =========================================================
# CREATE / UPDATE DONOR PROFILE
# =========================================================

@router.post("/profile")
def create_or_update_profile(
    data: DonorProfilePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):

    if current_user.role != "donor":

        raise HTTPException(
            status_code=403,
            detail="Only donors can create a donor profile"
        )

    profile = (
        db.query(DonorProfile)
        .filter(
            DonorProfile.user_id
            == current_user.id
        )
        .first()
    )

    # -----------------------------------------------------
    # UPDATE EXISTING PROFILE
    # -----------------------------------------------------

    if profile:

        profile.blood_group = (
            data.blood_group
        )

        profile.city = (
            data.city.strip()
        )

        profile.latitude = (
            data.latitude
        )

        profile.longitude = (
            data.longitude
        )

        profile.last_donation_date = (
            data.last_donation_date
        )

        profile.available = (
            data.available
        )

        message = (
            "Donor profile updated successfully"
        )

    # -----------------------------------------------------
    # CREATE NEW PROFILE
    # -----------------------------------------------------

    else:

        profile = DonorProfile(

            user_id=current_user.id,

            blood_group=data.blood_group,

            city=data.city.strip(),

            latitude=data.latitude,

            longitude=data.longitude,

            last_donation_date=(
                data.last_donation_date
            ),

            available=data.available
        )

        db.add(profile)

        message = (
            "Donor profile created successfully"
        )

    db.commit()
    db.refresh(profile)

    return {
        "message": message,

        "profile": {
            "id": profile.id,

            "blood_group":
                profile.blood_group,

            "city":
                profile.city,

            "latitude":
                profile.latitude,

            "longitude":
                profile.longitude,

            "last_donation_date":
                profile.last_donation_date,

            "available":
                profile.available
        }
    }


# =========================================================
# GET CURRENT DONOR PROFILE
# =========================================================

@router.get("/profile")
def get_donor_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):

    if current_user.role != "donor":

        raise HTTPException(
            status_code=403,
            detail="Only donors can access donor profile"
        )

    profile = (
        db.query(DonorProfile)
        .filter(
            DonorProfile.user_id
            == current_user.id
        )
        .first()
    )

    if not profile:

        raise HTTPException(
            status_code=404,
            detail="Donor profile not found"
        )

    return {
        "id": profile.id,

        "blood_group":
            profile.blood_group,

        "city":
            profile.city,

        "latitude":
            profile.latitude,

        "longitude":
            profile.longitude,

        "last_donation_date":
            profile.last_donation_date,

        "available":
            profile.available
    }


# =========================================================
# GET INCOMING MATCHED REQUESTS
# =========================================================

@router.get("/incoming-requests")
def get_incoming_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):

    if current_user.role != "donor":

        raise HTTPException(
            status_code=403,
            detail="Only donors can view incoming requests"
        )

    donor = (
        db.query(DonorProfile)
        .filter(
            DonorProfile.user_id
            == current_user.id
        )
        .first()
    )

    if not donor:

        raise HTTPException(
            status_code=404,
            detail="Create donor profile first"
        )

    matches = (
        db.query(Match)
        .filter(
            Match.donor_id == donor.id
        )
        .all()
    )

    result = []

    for match in matches:

        blood_request = (
            db.query(BloodRequest)
            .filter(
                BloodRequest.id
                == match.request_id
            )
            .first()
        )

        if not blood_request:
            continue

        # Don't display completed requests
        if blood_request.status == "completed":
            continue

        distance = calculate_distance(
            donor.latitude,
            donor.longitude,
            blood_request.latitude,
            blood_request.longitude
        )

        result.append(
            {
                "match_id": match.id,

                "request_id":
                    blood_request.id,

                "blood_group":
                    blood_request.blood_group,

                "hospital_name":
                    blood_request.hospital_name,

                "city":
                    blood_request.city,

                "units":
                    blood_request.units,

                "urgency":
                    blood_request.urgency,

                "request_status":
                    blood_request.status,

                "match_status":
                    match.status,

                "latitude":
                    blood_request.latitude,

                "longitude":
                    blood_request.longitude,

                "distance_km":
                    distance,

                "created_at":
                    blood_request.created_at
            }
        )

    # -----------------------------------------------------
    # NEAREST FIRST
    #
    # distance=None goes to bottom
    # -----------------------------------------------------

    result.sort(
        key=lambda item: (
            item["distance_km"] is None,
            item["distance_km"]
            if item["distance_km"] is not None
            else 999999
        )
    )

    return result