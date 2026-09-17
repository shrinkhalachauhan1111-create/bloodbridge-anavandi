from typing import Literal

from pydantic import BaseModel, Field


class BloodRequestCreate(BaseModel):

    blood_group: Literal[
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-"
    ]

    units: int = Field(
        gt=0,
        le=10
    )

    hospital_name: str

    city: str

    urgency: Literal[
        "normal",
        "urgent",
        "critical"
    ]