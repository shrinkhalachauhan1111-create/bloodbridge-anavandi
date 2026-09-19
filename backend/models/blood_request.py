from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Float,
)

from database import Base


class BloodRequest(Base):
    __tablename__ = "blood_requests"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    requester_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    blood_group = Column(
        String,
        nullable=False
    )

    units = Column(
        Integer,
        nullable=False
    )

    hospital_name = Column(
        String,
        nullable=False
    )

    city = Column(
        String,
        nullable=False
    )

    # NEW
    latitude = Column(
        Float,
        nullable=True
    )

    # NEW
    longitude = Column(
        Float,
        nullable=True
    )

    urgency = Column(
        String,
        default="urgent",
        nullable=False
    )

    status = Column(
        String,
        default="searching",
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    expires_at = Column(
        DateTime,
        nullable=True
    )