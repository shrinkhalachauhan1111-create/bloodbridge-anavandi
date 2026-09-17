from datetime import date, timedelta

from sqlalchemy.orm import Session

from models.donor import DonorProfile
from models.match import Match


MIN_DONATION_INTERVAL_DAYS = 90


def donation_interval_ok(last_donation_date):

    if last_donation_date is None:
        return True

    today = date.today()

    next_eligible_date = (
        last_donation_date
        + timedelta(days=MIN_DONATION_INTERVAL_DAYS)
    )

    return today >= next_eligible_date


def find_matching_donors(
    db: Session,
    blood_request
):

    print("\n--- MATCHING STARTED ---")
    print("Requested blood:", blood_request.blood_group)
    print("Requested city:", blood_request.city)

    donors = (
        db.query(DonorProfile)
        .filter(
            DonorProfile.blood_group == blood_request.blood_group,
            DonorProfile.available.is_(True)
        )
        .all()
    )

    print("Blood + availability matches:", len(donors))

    matching_donors = []

    for donor in donors:

        print("\nChecking donor:", donor.id)
        print("Blood:", donor.blood_group)
        print("City:", donor.city)
        print("Available:", donor.available)
        print("Last donation:", donor.last_donation_date)

        donor_city = donor.city.strip().lower()
        request_city = blood_request.city.strip().lower()

        if donor_city != request_city:
            print("Rejected: city mismatch")
            continue

        if not donation_interval_ok(
            donor.last_donation_date
        ):
            print("Rejected: donation interval")
            continue

        print("MATCH FOUND!")
        matching_donors.append(donor)

    print("Final matching donors:", len(matching_donors))
    print("--- MATCHING FINISHED ---\n")

    return matching_donors


def create_matches_for_request(
    db: Session,
    blood_request
):

    donors = find_matching_donors(
        db,
        blood_request
    )

    created_matches = []

    for donor in donors[:5]:

        existing_match = (
            db.query(Match)
            .filter(
                Match.request_id == blood_request.id,
                Match.donor_id == donor.id
            )
            .first()
        )

        if existing_match:
            continue

        new_match = Match(
            request_id=blood_request.id,
            donor_id=donor.id,
            status="pending"
        )

        db.add(new_match)
        created_matches.append(new_match)

    db.commit()

    return created_matches