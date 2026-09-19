from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Date,
    ForeignKey,
    Float,
)

from database import Base


class DonorProfile(Base):
    __tablename__ = "donor_profiles"

    # ==========================================
    # PRIMARY KEY
    # ==========================================

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # ==========================================
    # USER
    # ==========================================

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False,
        index=True
    )

    # ==========================================
    # BLOOD GROUP
    # ==========================================

    blood_group = Column(
        String,
        nullable=False
    )

    # ==========================================
    # CITY
    # ==========================================

    city = Column(
        String,
        nullable=False
    )

    # ==========================================
    # LAST DONATION DATE
    # ==========================================

    last_donation_date = Column(
        Date,
        nullable=True
    )

    # ==========================================
    # AVAILABILITY
    # ==========================================

    available = Column(
        Boolean,
        default=True,
        nullable=False
    )

    # ==========================================
    # GPS LOCATION
    # ==========================================

    latitude = Column(
        Float,
        nullable=True
    )

    longitude = Column(
        Float,
        nullable=True
    )