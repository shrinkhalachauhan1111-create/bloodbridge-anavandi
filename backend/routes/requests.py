from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

from database import get_db

from models.user import User
from models.blood_request import BloodRequest
from models.match import Match

from schemas.blood_request import BloodRequestCreate

from services.matching import create_matches_for_request

from utils.dependencies import get_current_user


router = APIRouter(
    tags=["Blood Requests"]
)


# =========================================================
# 1. CREATE BLOOD REQUEST
# =========================================================

@router.post("/blood-requests")
@router.post("/requests")
def create_blood_request(
    request_data: BloodRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # -----------------------------------------------------
    # Only requester can create blood request
    # -----------------------------------------------------

    if current_user.role != "requester":
        raise HTTPException(
            status_code=403,
            detail="Only requester can create a blood request",
        )

    # -----------------------------------------------------
    # Validate units
    # -----------------------------------------------------

    if request_data.units < 1:
        raise HTTPException(
            status_code=400,
            detail="Units must be at least 1",
        )

    # -----------------------------------------------------
    # Create request
    #
    # IMPORTANT:
    # GPS coordinates are saved here.
    # -----------------------------------------------------

    new_request = BloodRequest(
        requester_id=current_user.id,

        blood_group=request_data.blood_group.strip(),

        units=request_data.units,

        hospital_name=request_data.hospital_name.strip(),

        city=request_data.city.strip(),

        latitude=request_data.latitude,

        longitude=request_data.longitude,

        urgency=request_data.urgency.strip(),

        status="searching",
    )

    db.add(new_request)

    db.commit()

    db.refresh(new_request)

    # -----------------------------------------------------
    # Search for eligible nearby donors
    #
    # matching.py will:
    #
    # 1. check blood group
    # 2. check availability
    # 3. check donation interval
    # 4. calculate distance
    # 5. sort nearest donors
    # 6. create Match records
    # -----------------------------------------------------

    created_matches = create_matches_for_request(
        db,
        new_request,
    )

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {
        "message":
            "Blood request created successfully",

        "request": {
            "id":
                new_request.id,

            "blood_group":
                new_request.blood_group,

            "units":
                new_request.units,

            "hospital_name":
                new_request.hospital_name,

            "city":
                new_request.city,

            "latitude":
                new_request.latitude,

            "longitude":
                new_request.longitude,

            "urgency":
                new_request.urgency,

            "status":
                new_request.status,

            "created_at":
                new_request.created_at,

            "expires_at":
                getattr(
                    new_request,
                    "expires_at",
                    None,
                ),
        },

        "matching_donors_found":
            len(created_matches),
    }


# =========================================================
# 2. GET LOGGED-IN REQUESTER'S BLOOD REQUESTS
# =========================================================

@router.get("/blood-requests")
@router.get("/requests/my")
def get_my_blood_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "requester":
        raise HTTPException(
            status_code=403,
            detail="Only requester can view these requests",
        )

    blood_requests = (
        db.query(BloodRequest)
        .filter(
            BloodRequest.requester_id
            == current_user.id
        )
        .order_by(
            BloodRequest.created_at.desc()
        )
        .all()
    )

    result = []

    for blood_request in blood_requests:

        # -------------------------------------------------
        # Number of donors matched to this request
        # -------------------------------------------------

        matching_donors = (
            db.query(Match)
            .filter(
                Match.request_id
                == blood_request.id
            )
            .count()
        )

        result.append(
            {
                "id":
                    blood_request.id,

                "blood_group":
                    blood_request.blood_group,

                "units":
                    blood_request.units,

                "hospital_name":
                    blood_request.hospital_name,

                "city":
                    blood_request.city,

                "latitude":
                    blood_request.latitude,

                "longitude":
                    blood_request.longitude,

                "urgency":
                    blood_request.urgency,

                "status":
                    blood_request.status,

                "matching_donors":
                    matching_donors,

                "created_at":
                    blood_request.created_at,

                "expires_at":
                    getattr(
                        blood_request,
                        "expires_at",
                        None,
                    ),
            }
        )

    return result


# =========================================================
# 3. GET MATCHES FOR ONE BLOOD REQUEST
# =========================================================

@router.get(
    "/blood-requests/{request_id}/matches"
)
def get_request_matches(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # -----------------------------------------------------
    # Find blood request
    # -----------------------------------------------------

    blood_request = (
        db.query(BloodRequest)
        .filter(
            BloodRequest.id == request_id
        )
        .first()
    )

    if not blood_request:
        raise HTTPException(
            status_code=404,
            detail="Blood request not found",
        )

    # -----------------------------------------------------
    # Only the requester who created it
    # can view the matches
    # -----------------------------------------------------

    if (
        blood_request.requester_id
        != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You cannot view matches for this request",
        )

    matches = (
        db.query(Match)
        .filter(
            Match.request_id == request_id
        )
        .all()
    )

    result = []

    for match in matches:
        result.append(
            {
                "id":
                    match.id,

                "request_id":
                    match.request_id,

                "donor_id":
                    match.donor_id,

                "status":
                    match.status,

                "created_at":
                    match.created_at,

                "responded_at":
                    match.responded_at,
            }
        )

    return result


# =========================================================
# 4. GET SINGLE BLOOD REQUEST
# =========================================================

@router.get(
    "/requests/{request_id}"
)
def get_blood_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    blood_request = (
        db.query(BloodRequest)
        .filter(
            BloodRequest.id
            == request_id
        )
        .first()
    )

    if not blood_request:
        raise HTTPException(
            status_code=404,
            detail="Blood request not found",
        )

    # Requester can only see their own request
    if (
        current_user.role == "requester"
        and
        blood_request.requester_id
        != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You cannot view this request",
        )

    return {
        "id":
            blood_request.id,

        "requester_id":
            blood_request.requester_id,

        "blood_group":
            blood_request.blood_group,

        "units":
            blood_request.units,

        "hospital_name":
            blood_request.hospital_name,

        "city":
            blood_request.city,

        "latitude":
            blood_request.latitude,

        "longitude":
            blood_request.longitude,

        "urgency":
            blood_request.urgency,

        "status":
            blood_request.status,

        "created_at":
            blood_request.created_at,

        "expires_at":
            getattr(
                blood_request,
                "expires_at",
                None,
            ),
    }


# =========================================================
# 5. MARK REQUEST AS COMPLETED
# =========================================================

@router.put(
    "/blood-requests/{request_id}/complete"
)
def complete_blood_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # -----------------------------------------------------
    # Only requester
    # -----------------------------------------------------

    if current_user.role != "requester":
        raise HTTPException(
            status_code=403,
            detail="Only requester can complete a blood request",
        )

    # -----------------------------------------------------
    # Find request
    # -----------------------------------------------------

    blood_request = (
        db.query(BloodRequest)
        .filter(
            BloodRequest.id
            == request_id
        )
        .first()
    )

    if not blood_request:
        raise HTTPException(
            status_code=404,
            detail="Blood request not found",
        )

    # -----------------------------------------------------
    # Make sure request belongs to logged in user
    # -----------------------------------------------------

    if (
        blood_request.requester_id
        != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You cannot complete another requester's request",
        )

    # -----------------------------------------------------
    # Must already be matched
    # -----------------------------------------------------

    if blood_request.status != "matched":
        raise HTTPException(
            status_code=400,
            detail="Only matched requests can be completed",
        )

    # -----------------------------------------------------
    # Complete
    # -----------------------------------------------------

    blood_request.status = "completed"

    db.commit()

    db.refresh(blood_request)

    return {
        "message":
            "Blood request marked as completed",

        "request_id":
            blood_request.id,

        "status":
            blood_request.status,
    }


# =========================================================
# 6. REMATCH OLD SEARCHING REQUEST
# =========================================================

@router.post(
    "/blood-requests/{request_id}/rematch"
)
def rematch_blood_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # -----------------------------------------------------
    # Only requester
    # -----------------------------------------------------

    if current_user.role != "requester":
        raise HTTPException(
            status_code=403,
            detail="Only requester can rematch a request",
        )

    # -----------------------------------------------------
    # Find request
    # -----------------------------------------------------

    blood_request = (
        db.query(BloodRequest)
        .filter(
            BloodRequest.id
            == request_id
        )
        .first()
    )

    if not blood_request:
        raise HTTPException(
            status_code=404,
            detail="Blood request not found",
        )

    # -----------------------------------------------------
    # Check ownership
    # -----------------------------------------------------

    if (
        blood_request.requester_id
        != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You cannot rematch another requester's request",
        )

    # -----------------------------------------------------
    # Completed requests cannot be rematched
    # -----------------------------------------------------

    if blood_request.status == "completed":
        raise HTTPException(
            status_code=400,
            detail="Completed requests cannot be rematched",
        )

    # -----------------------------------------------------
    # Run matcher again
    # -----------------------------------------------------

    created_matches = create_matches_for_request(
        db,
        blood_request,
    )

    return {
        "message":
            "Matching donors searched again",

        "new_matches":
            len(created_matches),

        "request_id":
            blood_request.id,
    }