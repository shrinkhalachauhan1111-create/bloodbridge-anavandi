from datetime import date, timedelta
from math import radians, sin, cos, sqrt, atan2

from sqlalchemy.orm import Session

from models.donor import DonorProfile
from models.match import Match
from models.notification import Notification


# ============================================================
# SETTINGS
# ============================================================

MIN_DONATION_INTERVAL_DAYS = 90

MAX_SEARCH_DISTANCE_KM = 20

# Send a request to the nearest 5 eligible donors
MAX_MATCHES = 5


# ============================================================
# DONATION INTERVAL
# ============================================================

def donation_interval_ok(last_donation_date):

    if last_donation_date is None:
        return True

    today = date.today()

    next_eligible_date = (
        last_donation_date
        + timedelta(
            days=MIN_DONATION_INTERVAL_DAYS
        )
    )

    return today >= next_eligible_date


# ============================================================
# DISTANCE
# ============================================================

def calculate_distance_km(
    lat1,
    lon1,
    lat2,
    lon2
):
    earth_radius_km = 6371.0

    lat1 = radians(lat1)
    lon1 = radians(lon1)

    lat2 = radians(lat2)
    lon2 = radians(lon2)

    difference_lat = lat2 - lat1
    difference_lon = lon2 - lon1

    a = (
        sin(difference_lat / 2) ** 2
        +
        cos(lat1)
        * cos(lat2)
        * sin(difference_lon / 2) ** 2
    )

    c = 2 * atan2(
        sqrt(a),
        sqrt(1 - a)
    )

    distance = earth_radius_km * c

    return round(distance, 2)


# ============================================================
# COMPATIBILITY FUNCTION
# ============================================================

def calculate_distance(
    lat1,
    lon1,
    lat2,
    lon2
):
    return calculate_distance_km(
        lat1,
        lon1,
        lat2,
        lon2
    )


# ============================================================
# FIND NEAREST DONORS
# ============================================================

def find_matching_donors(
    db: Session,
    blood_request
):

    # --------------------------------------------------------
    # SAME BLOOD GROUP + AVAILABLE
    # --------------------------------------------------------

    donors = (
        db.query(DonorProfile)
        .filter(
            DonorProfile.blood_group
            == blood_request.blood_group,

            DonorProfile.available.is_(True)
        )
        .all()
    )


    # --------------------------------------------------------
    # DONATION ELIGIBILITY
    # --------------------------------------------------------

    eligible_donors = []

    for donor in donors:

        if donation_interval_ok(
            donor.last_donation_date
        ):
            eligible_donors.append(
                donor
            )


    if not eligible_donors:
        return []


    # --------------------------------------------------------
    # REQUEST GPS
    # --------------------------------------------------------

    request_has_location = (
        blood_request.latitude is not None
        and
        blood_request.longitude is not None
    )


    # ========================================================
    # GPS MATCHING
    # ========================================================

    if request_has_location:

        donors_with_distance = []


        for donor in eligible_donors:

            if (
                donor.latitude is None
                or
                donor.longitude is None
            ):
                continue


            distance = calculate_distance_km(

                blood_request.latitude,
                blood_request.longitude,

                donor.latitude,
                donor.longitude
            )


            print(
                f"Donor ID {donor.id}"
                f" -> {distance} km"
            )


            if distance <= MAX_SEARCH_DISTANCE_KM:

                donors_with_distance.append(
                    {
                        "donor": donor,
                        "distance": distance,
                    }
                )


        # ----------------------------------------------------
        # SHORTEST → LONGEST
        # ----------------------------------------------------

        donors_with_distance.sort(
            key=lambda item:
                item["distance"]
        )


        if donors_with_distance:

            print(
                "\nNearest eligible donors:"
            )

            for item in donors_with_distance[
                :MAX_MATCHES
            ]:

                print(
                    f"Donor {item['donor'].id}"
                    f" -> "
                    f"{item['distance']} km"
                )


            # Return nearest 5
            return [
                item["donor"]
                for item
                in donors_with_distance[
                    :MAX_MATCHES
                ]
            ]


    # ========================================================
    # FALLBACK TO SAME CITY
    # ========================================================

    city_matches = []

    for donor in eligible_donors:

        if (
            donor.city
            and
            blood_request.city
            and
            donor.city.strip().lower()
            ==
            blood_request.city.strip().lower()
        ):

            city_matches.append(
                donor
            )


    return city_matches[:MAX_MATCHES]


# ============================================================
# CREATE MATCHES
# ============================================================

def create_matches_for_request(
    db: Session,
    blood_request
):

    donors = find_matching_donors(
        db,
        blood_request
    )


    created_matches = []


    for donor in donors:

        # ----------------------------------------------------
        # PREVENT DUPLICATES
        # ----------------------------------------------------

        existing_match = (
            db.query(Match)
            .filter(

                Match.request_id
                == blood_request.id,

                Match.donor_id
                == donor.id
            )
            .first()
        )


        if existing_match:
            continue


        # ----------------------------------------------------
        # CREATE MATCH
        # ----------------------------------------------------

        new_match = Match(

            request_id=
                blood_request.id,

            donor_id=
                donor.id,

            status="pending"
        )


        db.add(new_match)

        db.flush()


        # ----------------------------------------------------
        # DISTANCE TEXT
        # ----------------------------------------------------

        distance_text = ""


        if (
            blood_request.latitude is not None
            and
            blood_request.longitude is not None
            and
            donor.latitude is not None
            and
            donor.longitude is not None
        ):

            distance = calculate_distance_km(

                blood_request.latitude,
                blood_request.longitude,

                donor.latitude,
                donor.longitude
            )


            distance_text = (
                f" You are approximately "
                f"{distance} km away."
            )


        # ----------------------------------------------------
        # DONOR NOTIFICATION
        # ----------------------------------------------------

        notification = Notification(

            user_id=
                donor.user_id,

            title=
                "Nearby blood request",

            message=(
                f"{blood_request.blood_group} blood "
                f"is needed at "
                f"{blood_request.hospital_name}, "
                f"{blood_request.city}."
                f"{distance_text}"
            ),

            notification_type=
                "blood_request",

            request_id=
                blood_request.id,

            match_id=
                new_match.id,

            is_read=False
        )


        db.add(notification)

        created_matches.append(
            new_match
        )


    db.commit()


    print(
        f"\nCreated "
        f"{len(created_matches)} "
        f"donor match(es)"
    )


    return created_matches