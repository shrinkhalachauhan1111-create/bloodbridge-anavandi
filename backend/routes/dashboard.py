from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db

from models.user import User
from models.donor import DonorProfile
from models.blood_request import BloodRequest
from models.match import Match

from utils.dependencies import get_current_user


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


# =========================================================
# REQUESTER DASHBOARD
# =========================================================

@router.get("/requester")
def requester_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Only requester accounts can access this dashboard
    if current_user.role != "requester":
        raise HTTPException(
            status_code=403,
            detail="Only requesters can access this dashboard"
        )

    # Get all blood requests created by this requester
    requests = (
        db.query(BloodRequest)
        .filter(
            BloodRequest.requester_id == current_user.id
        )
        .order_by(
            BloodRequest.created_at.desc()
        )
        .all()
    )

    # -----------------------------
    # Dashboard statistics
    # -----------------------------

    total_requests = len(requests)

    active_requests = sum(
        1
        for request in requests
        if request.status == "searching"
    )

    matched_requests = sum(
        1
        for request in requests
        if request.status == "matched"
    )

    completed_requests = sum(
        1
        for request in requests
        if request.status == "completed"
    )


    # -----------------------------
    # Recent blood requests
    # -----------------------------

    recent_requests = []

    for request in requests[:5]:

        # Count how many donors were matched
        matching_donors = (
            db.query(Match)
            .filter(
                Match.request_id == request.id
            )
            .count()
        )

        # Check whether a donor accepted
        accepted_match = (
            db.query(Match)
            .filter(
                Match.request_id == request.id,
                Match.status == "accepted"
            )
            .first()
        )

        recent_requests.append({

            "id": request.id,

            "blood_group": request.blood_group,

            "units": request.units,

            "hospital_name": request.hospital_name,

            "city": request.city,

            "urgency": request.urgency,

            "status": request.status,

            "matching_donors": matching_donors,

            "donor_accepted": accepted_match is not None,

            # Needed by React to call:
            # GET /matches/{match_id}/contact
            "accepted_match_id":
                accepted_match.id
                if accepted_match
                else None,

            "created_at": request.created_at,

            "expires_at": request.expires_at
        })


    # -----------------------------
    # Final requester response
    # -----------------------------

    return {

        "requester": {

            "id": current_user.id,

            "name": current_user.name,

            "email": current_user.email,

            "phone": current_user.phone
        },

        "stats": {

            "total_requests": total_requests,

            "active_requests": active_requests,

            "matched_requests": matched_requests,

            "completed_requests": completed_requests
        },

        "recent_requests": recent_requests
    }


# =========================================================
# DONOR DASHBOARD
# =========================================================

@router.get("/donor")
def donor_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Only donors can access this dashboard
    if current_user.role != "donor":
        raise HTTPException(
            status_code=403,
            detail="Only donors can access this dashboard"
        )


    # Get donor profile
    donor_profile = (
        db.query(DonorProfile)
        .filter(
            DonorProfile.user_id == current_user.id
        )
        .first()
    )


    if not donor_profile:
        raise HTTPException(
            status_code=404,
            detail="Donor profile not found"
        )


    # Get all matches for this donor
    matches = (
        db.query(Match)
        .filter(
            Match.donor_id == donor_profile.id
        )
        .order_by(
            Match.created_at.desc()
        )
        .all()
    )


    # -----------------------------
    # Donor statistics
    # -----------------------------

    pending_requests = sum(
        1
        for match in matches
        if match.status == "pending"
    )

    accepted_requests = sum(
        1
        for match in matches
        if match.status == "accepted"
    )

    declined_requests = sum(
        1
        for match in matches
        if match.status == "declined"
    )


    # -----------------------------
    # Incoming blood requests
    # -----------------------------

    incoming_requests = []


    for match in matches[:10]:

        blood_request = (
            db.query(BloodRequest)
            .filter(
                BloodRequest.id == match.request_id
            )
            .first()
        )


        if blood_request:

            incoming_requests.append({

                "match_id": match.id,

                "match_status": match.status,

                "blood_group": blood_request.blood_group,

                "units": blood_request.units,

                "hospital_name": blood_request.hospital_name,

                "city": blood_request.city,

                "urgency": blood_request.urgency,

                "request_status": blood_request.status,

                "created_at": blood_request.created_at,

                "expires_at": blood_request.expires_at
            })


    # -----------------------------
    # Final donor response
    # -----------------------------

    return {

        "donor": {

            "id": current_user.id,

            "name": current_user.name,

            "email": current_user.email,

            "phone": current_user.phone,

            "blood_group": donor_profile.blood_group,

            "city": donor_profile.city,

            "last_donation_date":
                donor_profile.last_donation_date,

            "available":
                donor_profile.available
        },

        "stats": {

            "pending_requests":
                pending_requests,

            "accepted_requests":
                accepted_requests,

            "declined_requests":
                declined_requests
        },

        "incoming_requests":
            incoming_requests
    }