from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.donor import DonorProfile
from models.user import User
from schemas.donor import (
    DonorProfileCreate,
    AvailabilityUpdate
)
from utils.dependencies import get_current_user


router = APIRouter(
    prefix="/donors",
    tags=["Donors"]
)


@router.post("/profile")
def create_donor_profile(
    profile: DonorProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role != "donor":
        raise HTTPException(
            status_code=403,
            detail="Only donors can create donor profiles"
        )

    existing_profile = (
        db.query(DonorProfile)
        .filter(
            DonorProfile.user_id == current_user.id
        )
        .first()
    )

    if existing_profile:
        raise HTTPException(
            status_code=400,
            detail="Donor profile already exists"
        )

    new_profile = DonorProfile(
        user_id=current_user.id,
        blood_group=profile.blood_group,
        city=profile.city,
        last_donation_date=profile.last_donation_date,
        available=profile.available
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return {
        "message": "Donor profile created successfully",
        "profile": {
            "id": new_profile.id,
            "blood_group": new_profile.blood_group,
            "city": new_profile.city,
            "last_donation_date": new_profile.last_donation_date,
            "available": new_profile.available
        }
    }


@router.get("/profile")
def get_donor_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role != "donor":
        raise HTTPException(
            status_code=403,
            detail="Only donors can access donor profiles"
        )

    profile = (
        db.query(DonorProfile)
        .filter(
            DonorProfile.user_id == current_user.id
        )
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Donor profile not found"
        )

    return {
        "name": current_user.name,
        "email": current_user.email,
        "blood_group": profile.blood_group,
        "city": profile.city,
        "last_donation_date": profile.last_donation_date,
        "available": profile.available
    }


@router.patch("/availability")
def update_availability(
    data: AvailabilityUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role != "donor":
        raise HTTPException(
            status_code=403,
            detail="Only donors can update availability"
        )

    profile = (
        db.query(DonorProfile)
        .filter(
            DonorProfile.user_id == current_user.id
        )
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Donor profile not found"
        )

    profile.available = data.available

    db.commit()
    db.refresh(profile)

    return {
        "message": "Availability updated successfully",
        "available": profile.available
    }