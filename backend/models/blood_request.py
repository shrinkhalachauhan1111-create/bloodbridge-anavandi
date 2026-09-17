from datetime import datetime, timezone, timedelta

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey
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
        nullable=False
    )

    blood_group = Column(
        String(5),
        nullable=False
    )

    units = Column(
        Integer,
        nullable=False
    )

    hospital_name = Column(
        String(150),
        nullable=False
    )

    city = Column(
        String(100),
        nullable=False
    )

    urgency = Column(
        String(20),
        nullable=False
    )

    status = Column(
        String(30),
        default="searching"
    )

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    expires_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc) + timedelta(hours=6)
    )