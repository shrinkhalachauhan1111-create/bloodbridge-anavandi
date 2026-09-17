from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db

from models.user import User
from models.donor import DonorProfile
from models.match import Match
from models.blood_request import BloodRequest

from utils.dependencies import get_current_user


router = APIRouter(
    prefix="/matches",
    tags=["Matches"]
)


@router.get("/my")
def get_my_matches(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role != "donor":
        raise HTTPException(
            status_code=403,
            detail="Only donors can view matching requests"
        )

    donor_profile = (
        db.query(DonorProfile)
        .filter(DonorProfile.user_id == current_user.id)
        .first()
    )

    if not donor_profile:
        raise HTTPException(
            status_code=404,
            detail="Donor profile not found"
        )

    matches = (
        db.query(Match)
        .filter(Match.donor_id == donor_profile.id)
        .all()
    )

    result = []

    for match in matches:
        blood_request = (
            db.query(BloodRequest)
            .filter(BloodRequest.id == match.request_id)
            .first()
        )

        if blood_request:
            result.append({
                "match_id": match.id,
                "status": match.status,
                "request": {
                    "blood_group": blood_request.blood_group,
                    "units": blood_request.units,
                    "hospital_name": blood_request.hospital_name,
                    "city": blood_request.city,
                    "urgency": blood_request.urgency
                }
            })

    return result


@router.patch("/{match_id}/accept")
def accept_match(
    match_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role != "donor":
        raise HTTPException(
            status_code=403,
            detail="Only donors can accept requests"
        )

    donor_profile = (
        db.query(DonorProfile)
        .filter(DonorProfile.user_id == current_user.id)
        .first()
    )

    if not donor_profile:
        raise HTTPException(
            status_code=404,
            detail="Donor profile not found"
        )

    match = (
        db.query(Match)
        .filter(
            Match.id == match_id,
            Match.donor_id == donor_profile.id
        )
        .first()
    )

    if not match:
        raise HTTPException(
            status_code=404,
            detail="Match not found"
        )

    if match.status != "pending":
        raise HTTPException(
            status_code=400,
            detail="This request has already been responded to"
        )

    match.status = "accepted"
    match.responded_at = datetime.now(timezone.utc)

    blood_request = (
        db.query(BloodRequest)
        .filter(BloodRequest.id == match.request_id)
        .first()
    )

    if blood_request:
        blood_request.status = "matched"

    donor_profile.available = False

    db.commit()

    return {
        "message": "Blood request accepted successfully",
        "match_id": match.id,
        "status": match.status
    }


@router.patch("/{match_id}/decline")
def decline_match(
    match_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role != "donor":
        raise HTTPException(
            status_code=403,
            detail="Only donors can decline requests"
        )

    donor_profile = (
        db.query(DonorProfile)
        .filter(DonorProfile.user_id == current_user.id)
        .first()
    )

    if not donor_profile:
        raise HTTPException(
            status_code=404,
            detail="Donor profile not found"
        )

    match = (
        db.query(Match)
        .filter(
            Match.id == match_id,
            Match.donor_id == donor_profile.id
        )
        .first()
    )

    if not match:
        raise HTTPException(
            status_code=404,
            detail="Match not found"
        )

    if match.status != "pending":
        raise HTTPException(
            status_code=400,
            detail="This request has already been responded to"
        )

    match.status = "declined"
    match.responded_at = datetime.now(timezone.utc)

    db.commit()

    return {
        "message": "Blood request declined",
        "match_id": match.id,
        "status": match.status
    }


@router.get("/{match_id}/contact")
def get_donor_contact(
    match_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role != "requester":
        raise HTTPException(
            status_code=403,
            detail="Only requesters can access donor contact"
        )

    match = (
        db.query(Match)
        .filter(Match.id == match_id)
        .first()
    )

    if not match:
        raise HTTPException(
            status_code=404,
            detail="Match not found"
        )

    blood_request = (
        db.query(BloodRequest)
        .filter(BloodRequest.id == match.request_id)
        .first()
    )

    if not blood_request:
        raise HTTPException(
            status_code=404,
            detail="Blood request not found"
        )

    if blood_request.requester_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You cannot access this donor"
        )

    if match.status != "accepted":
        raise HTTPException(
            status_code=403,
            detail="Donor contact is hidden until the donor accepts"
        )

    donor_profile = (
        db.query(DonorProfile)
        .filter(DonorProfile.id == match.donor_id)
        .first()
    )

    if not donor_profile:
        raise HTTPException(
            status_code=404,
            detail="Donor profile not found"
        )

    donor_user = (
        db.query(User)
        .filter(User.id == donor_profile.user_id)
        .first()
    )

    if not donor_user:
        raise HTTPException(
            status_code=404,
            detail="Donor user not found"
        )

    return {
        "message": "Donor accepted the request",
        "donor": {
            "name": donor_user.name,
            "phone": donor_user.phone,
            "email": donor_user.email,
            "blood_group": donor_profile.blood_group,
            "city": donor_profile.city
        }
    }