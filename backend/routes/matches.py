from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.donor import DonorProfile
from models.blood_request import BloodRequest
from models.match import Match
from utils.dependencies import get_current_user


router = APIRouter(
    prefix="/matches",
    tags=["Matches"]
)


# ============================================================
# 1. GET ALL MATCHES FOR LOGGED-IN DONOR
# ============================================================

@router.get("/my")
def get_my_matches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only donors can access this endpoint
    if current_user.role != "donor":
        raise HTTPException(
            status_code=403,
            detail="Only donors can view donor matches"
        )

    # Find donor profile belonging to logged-in user
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

    # Get all matches belonging to this donor
    matches = (
        db.query(Match)
        .filter(Match.donor_id == donor_profile.id)
        .order_by(Match.created_at.desc())
        .all()
    )

    result = []

    for match in matches:

        blood_request = (
            db.query(BloodRequest)
            .filter(BloodRequest.id == match.request_id)
            .first()
        )

        if not blood_request:
            continue

        result.append({
            "match_id": match.id,
            "match_status": match.status,

            "request_id": blood_request.id,
            "blood_group": blood_request.blood_group,
            "units": blood_request.units,
            "hospital_name": blood_request.hospital_name,
            "city": blood_request.city,
            "urgency": blood_request.urgency,
            "request_status": blood_request.status,

            "created_at": match.created_at,
            "responded_at": match.responded_at
        })

    return result


# ============================================================
# 2. DONOR ACCEPTS A MATCH
# ============================================================

@router.patch("/{match_id}/accept")
def accept_match(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only donors can accept matches
    if current_user.role != "donor":
        raise HTTPException(
            status_code=403,
            detail="Only donors can accept blood requests"
        )

    # Get donor profile
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

    # Find requested match
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

    # Make sure this match belongs to this donor
    if match.donor_id != donor_profile.id:
        raise HTTPException(
            status_code=403,
            detail="You cannot respond to this match"
        )

    # Donor can only accept pending matches
    if match.status != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"This match is already {match.status}"
        )

    # Find blood request
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

    # --------------------------------------------------------
    # ACCEPT CURRENT DONOR
    # --------------------------------------------------------

    match.status = "accepted"
    match.responded_at = datetime.utcnow()

    # Request is now matched
    blood_request.status = "matched"

    # Donor should not receive another request immediately
    donor_profile.available = False


    # --------------------------------------------------------
    # ADVANCED FEATURE:
    # CANCEL ALL OTHER PENDING MATCHES FOR THIS REQUEST
    # --------------------------------------------------------

    other_matches = (
        db.query(Match)
        .filter(
            Match.request_id == match.request_id,
            Match.id != match.id,
            Match.status == "pending"
        )
        .all()
    )

    cancelled_count = 0

    for other_match in other_matches:
        other_match.status = "cancelled"
        other_match.responded_at = datetime.utcnow()
        cancelled_count += 1


    db.commit()

    db.refresh(match)
    db.refresh(blood_request)
    db.refresh(donor_profile)


    return {
        "message": "Blood request accepted successfully",
        "match_id": match.id,
        "match_status": match.status,
        "request_status": blood_request.status,
        "donor_available": donor_profile.available,
        "other_matches_cancelled": cancelled_count
    }


# ============================================================
# 3. DONOR DECLINES A MATCH
# ============================================================

@router.patch("/{match_id}/decline")
def decline_match(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "donor":
        raise HTTPException(
            status_code=403,
            detail="Only donors can decline blood requests"
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
        .filter(Match.id == match_id)
        .first()
    )

    if not match:
        raise HTTPException(
            status_code=404,
            detail="Match not found"
        )

    # Security check
    if match.donor_id != donor_profile.id:
        raise HTTPException(
            status_code=403,
            detail="You cannot respond to this match"
        )

    if match.status != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"This match is already {match.status}"
        )

    match.status = "declined"
    match.responded_at = datetime.utcnow()

    db.commit()
    db.refresh(match)

    return {
        "message": "Blood request declined",
        "match_id": match.id,
        "match_status": match.status
    }


# ============================================================
# 4. REQUESTER GETS DONOR CONTACT
# ============================================================

@router.get("/{match_id}/contact")
def get_donor_contact(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only requesters should see donor contact
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

    # Privacy protection
    if match.status != "accepted":
        raise HTTPException(
            status_code=403,
            detail="Donor contact is available only after donor acceptance"
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

    # Make sure requester owns this request
    if blood_request.requester_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You cannot access donor contact for this request"
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
        "message": "Donor contact unlocked",
        "donor": {
            "name": donor_user.name,
            "phone": donor_user.phone,
            "email": donor_user.email,
            "blood_group": donor_profile.blood_group,
            "city": donor_profile.city
        }
    }