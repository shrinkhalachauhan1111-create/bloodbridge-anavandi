from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Date,
    ForeignKey
)

from database import Base


class DonorProfile(Base):
    __tablename__ = "donor_profiles"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    blood_group = Column(
        String(5),
        nullable=False
    )

    city = Column(
        String(100),
        nullable=False
    )

    last_donation_date = Column(
        Date,
        nullable=True
    )

    available = Column(
        Boolean,
        default=True
    )