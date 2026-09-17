from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey
)

from database import Base


class Match(Base):
    __tablename__ = "matches"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    request_id = Column(
        Integer,
        ForeignKey("blood_requests.id"),
        nullable=False
    )

    donor_id = Column(
        Integer,
        ForeignKey("donor_profiles.id"),
        nullable=False
    )

    status = Column(
        String(20),
        default="pending"
    )

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    responded_at = Column(
        DateTime(timezone=True),
        nullable=True
    )