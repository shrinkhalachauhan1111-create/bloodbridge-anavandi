from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db

from models.user import User
from models.donor import DonorProfile
from models.blood_request import BloodRequest
from models.match import Match

from services.matching import calculate_distance_km

from utils.dependencies import get_current_user


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


# ============================================================
# REQUESTER DASHBOARD
# ============================================================

@router.get("/requester")
def requester_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------------
    # ONLY REQUESTERS
    # --------------------------------------------------------

    if current_user.role != "requester":
        raise HTTPException(
            status_code=403,
            detail="Requester access required"
        )


    # --------------------------------------------------------
    # GET REQUESTER'S REQUESTS
    # --------------------------------------------------------

    requests = (
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


    # --------------------------------------------------------
    # STATS
    # --------------------------------------------------------

    total_requests = len(requests)

    searching = 0
    matched = 0
    completed = 0


    for request in requests:

        if request.status == "searching":
            searching += 1

        elif request.status == "matched":
            matched += 1

        elif request.status == "completed":
            completed += 1


    # --------------------------------------------------------
    # RECENT REQUESTS
    # --------------------------------------------------------

    recent_requests = []


    for request in requests:

        # Count matches created for this request
        matching_donors = (
            db.query(Match)
            .filter(
                Match.request_id
                == request.id
            )
            .count()
        )


        # Check if one donor accepted
        accepted_match = (
            db.query(Match)
            .filter(
                Match.request_id
                == request.id,

                Match.status
                == "accepted"
            )
            .first()
        )


        recent_requests.append(
            {
                "id":
                    request.id,

                "blood_group":
                    request.blood_group,

                "units":
                    request.units,

                "hospital_name":
                    request.hospital_name,

                "city":
                    request.city,

                "latitude":
                    request.latitude,

                "longitude":
                    request.longitude,

                "urgency":
                    request.urgency,

                "status":
                    request.status,

                "matching_donors":
                    matching_donors,

                "donor_accepted":
                    accepted_match
                    is not None,

                "accepted_match_id":
                    accepted_match.id
                    if accepted_match
                    else None,

                "created_at":
                    request.created_at,

                "expires_at":
                    request.expires_at,
            }
        )


    return {

        "stats": {

            "total_requests":
                total_requests,

            "searching":
                searching,

            "matched":
                matched,

            "completed":
                completed,
        },

        "recent_requests":
            recent_requests,
    }


# ============================================================
# DONOR DASHBOARD
# ============================================================

@router.get("/donor")
def donor_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------------
    # ONLY DONORS
    # --------------------------------------------------------

    if current_user.role != "donor":
        raise HTTPException(
            status_code=403,
            detail="Donor access required"
        )


    # --------------------------------------------------------
    # GET DONOR PROFILE
    # --------------------------------------------------------

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
            detail="Donor profile not found"
        )


    # --------------------------------------------------------
    # GET ALL MATCHES FOR DONOR
    # --------------------------------------------------------

    matches = (
        db.query(Match)
        .filter(
            Match.donor_id
            == donor.id
        )
        .order_by(
            Match.created_at.desc()
        )
        .all()
    )


    # ========================================================
    # MATCH STATS
    # ========================================================

    accepted_count = 0
    declined_count = 0
    cancelled_count = 0


    for match in matches:

        if match.status == "accepted":
            accepted_count += 1

        elif match.status == "declined":
            declined_count += 1

        elif match.status == "cancelled":
            cancelled_count += 1


    # ========================================================
    # FIND ALL PENDING REQUESTS
    # ========================================================

    pending_candidates = []


    for match in matches:

        if match.status != "pending":
            continue


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


        # Skip requests that are already finished/matched
        # by another donor.
        if blood_request.status != "searching":
            continue


        # ----------------------------------------------------
        # CALCULATE DISTANCE
        # ----------------------------------------------------

        distance_km = None


        if (
            donor.latitude is not None
            and donor.longitude is not None
            and blood_request.latitude is not None
            and blood_request.longitude is not None
        ):

            distance_km = (
                calculate_distance_km(

                    donor.latitude,
                    donor.longitude,

                    blood_request.latitude,
                    blood_request.longitude
                )
            )


        pending_candidates.append(
            {
                "match":
                    match,

                "request":
                    blood_request,

                "distance_km":
                    distance_km,
            }
        )


    # ========================================================
    # SELECT SHORTEST DISTANCE
    # ========================================================

    nearest_pending = None


    # Requests that actually have GPS distance
    requests_with_distance = [
        candidate
        for candidate in pending_candidates
        if candidate["distance_km"]
        is not None
    ]


    if requests_with_distance:

        # Sort:
        # 0.5 km
        # 2 km
        # 7 km
        # etc.
        requests_with_distance.sort(
            key=lambda item:
                item["distance_km"]
        )


        nearest_pending = (
            requests_with_distance[0]
        )


        print("\n==============================")
        print("DONOR NEAREST REQUEST CHECK")
        print("==============================")


        for item in requests_with_distance:

            print(
                f"Request ID "
                f"{item['request'].id}"
                f" -> "
                f"{item['distance_km']} km"
            )


        print(
            f"\nSelected Request ID "
            f"{nearest_pending['request'].id}"
            f" at "
            f"{nearest_pending['distance_km']} km"
        )


    # --------------------------------------------------------
    # FALLBACK
    # If no pending request has GPS,
    # show most recent pending match.
    # --------------------------------------------------------

    elif pending_candidates:

        nearest_pending = (
            pending_candidates[0]
        )


    # ========================================================
    # BUILD INCOMING REQUEST LIST
    # ========================================================

    incoming_requests = []


    # --------------------------------------------------------
    # ONLY NEAREST PENDING REQUEST
    # --------------------------------------------------------

    if nearest_pending:

        match = (
            nearest_pending["match"]
        )

        blood_request = (
            nearest_pending["request"]
        )

        distance_km = (
            nearest_pending[
                "distance_km"
            ]
        )


        incoming_requests.append(
            {
                "match_id":
                    match.id,

                "match_status":
                    match.status,

                "request_id":
                    blood_request.id,

                "blood_group":
                    blood_request.blood_group,

                "units":
                    blood_request.units,

                "hospital_name":
                    blood_request.hospital_name,

                "city":
                    blood_request.city,

                "urgency":
                    blood_request.urgency,

                "request_status":
                    blood_request.status,

                "distance_km":
                    distance_km,

                "created_at":
                    blood_request.created_at,

                "expires_at":
                    blood_request.expires_at,
            }
        )


    # ========================================================
    # ADD DONOR'S ACCEPTED / DECLINED / CANCELLED HISTORY
    # ========================================================

    for match in matches:

        if match.status == "pending":
            continue


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


        distance_km = None


        if (
            donor.latitude is not None
            and donor.longitude is not None
            and blood_request.latitude is not None
            and blood_request.longitude is not None
        ):

            distance_km = (
                calculate_distance_km(

                    donor.latitude,
                    donor.longitude,

                    blood_request.latitude,
                    blood_request.longitude
                )
            )


        incoming_requests.append(
            {
                "match_id":
                    match.id,

                "match_status":
                    match.status,

                "request_id":
                    blood_request.id,

                "blood_group":
                    blood_request.blood_group,

                "units":
                    blood_request.units,

                "hospital_name":
                    blood_request.hospital_name,

                "city":
                    blood_request.city,

                "urgency":
                    blood_request.urgency,

                "request_status":
                    blood_request.status,

                "distance_km":
                    distance_km,

                "created_at":
                    blood_request.created_at,

                "expires_at":
                    blood_request.expires_at,
            }
        )


    # ========================================================
    # RETURN DASHBOARD
    # ========================================================

    return {

        "profile": {

            "id":
                donor.id,

            "blood_group":
                donor.blood_group,

            "city":
                donor.city,

            "latitude":
                donor.latitude,

            "longitude":
                donor.longitude,

            "last_donation_date":
                donor.last_donation_date,

            "available":
                donor.available,
        },


        "stats": {

            # Only nearest pending request
            # is shown to donor
            "pending":
                1
                if nearest_pending
                else 0,

            "accepted":
                accepted_count,

            "declined":
                declined_count,

            "cancelled":
                cancelled_count,
        },


        "incoming_requests":
            incoming_requests,
    }