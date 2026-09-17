from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.blood_request import BloodRequest
from schemas.blood_request import BloodRequestCreate
from utils.dependencies import get_current_user
from services.matching import create_matches_for_request


router = APIRouter(
    prefix="/requests",
    tags=["Blood Requests"]
)


@router.post("")
def create_blood_request(
    request_data: BloodRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Only requester/hospital accounts can create blood requests
    if current_user.role != "requester":
        raise HTTPException(
            status_code=403,
            detail="Only requesters can create blood requests"
        )

    # Create a new blood request
    new_request = BloodRequest(
        requester_id=current_user.id,
        blood_group=request_data.blood_group,
        units=request_data.units,
        hospital_name=request_data.hospital_name,
        city=request_data.city,
        urgency=request_data.urgency,
        status="searching"
    )

    # Save request in PostgreSQL
    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    # Automatically run donor matching
    matches = create_matches_for_request(
        db,
        new_request
    )

    return {
        "message": "Blood request created successfully",
        "request": {
            "id": new_request.id,
            "blood_group": new_request.blood_group,
            "units": new_request.units,
            "hospital_name": new_request.hospital_name,
            "city": new_request.city,
            "urgency": new_request.urgency,
            "status": new_request.status,
            "created_at": new_request.created_at,
            "expires_at": new_request.expires_at
        },
        "matching_donors_found": len(matches)
    }


@router.get("/my")
def get_my_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Only requester accounts should see this list
    if current_user.role != "requester":
        raise HTTPException(
            status_code=403,
            detail="Only requesters can view their blood requests"
        )

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

    return requests


@router.get("/{request_id}")
def get_blood_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

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
            detail="Blood request not found"
        )

    # A requester should only be able to see their own request.
    # Donors will later use the match APIs to see requests sent to them.
    if current_user.role == "requester":
        if blood_request.requester_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You cannot view this blood request"
            )

    return {
        "id": blood_request.id,
        "blood_group": blood_request.blood_group,
        "units": blood_request.units,
        "hospital_name": blood_request.hospital_name,
        "city": blood_request.city,
        "urgency": blood_request.urgency,
        "status": blood_request.status,
        "created_at": blood_request.created_at,
        "expires_at": blood_request.expires_at
    }