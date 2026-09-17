from typing import Literal

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    role: Literal["donor", "requester"]


class UserLogin(BaseModel):
    email: EmailStr
    password: str