import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine


# ============================================================
# IMPORT MODELS
# ============================================================

from models.user import User
from models.donor import DonorProfile
from models.blood_request import BloodRequest
from models.match import Match
from models.notification import Notification


# ============================================================
# IMPORT ROUTERS
# ============================================================

from routes.auth import router as auth_router
from routes.donors import router as donor_router
from routes.requests import router as request_router
from routes.matches import router as match_router
from routes.dashboard import router as dashboard_router
from routes.notifications import router as notification_router


# ============================================================
# CREATE TABLES
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# CREATE FASTAPI APP
# IMPORTANT: app must exist BEFORE app.add_middleware()
# ============================================================

app = FastAPI(
    title="BloodBridge API",
    description="Privacy-first blood donor matching platform",
    version="2.0.0",
)


# ============================================================
# CORS
# ============================================================

frontend_url = os.getenv("FRONTEND_URL")


allowed_origins = [
    # Local frontend
    "http://localhost:5173",
    "http://127.0.0.1:5173",

    # Old deployed frontend
    "https://bloodbridge-frontend-iqh9.onrender.com",

    # Advanced deployed frontend
    "https://bloodbridge-frontend-advanced.onrender.com",
]


# Also read frontend URL from Render environment
if frontend_url:

    frontend_url = (
        frontend_url
        .strip()
        .rstrip("/")
    )

    if frontend_url not in allowed_origins:
        allowed_origins.append(
            frontend_url
        )


print(
    "Allowed frontend origins:",
    allowed_origins
)


app.add_middleware(
    CORSMiddleware,

    allow_origins=allowed_origins,

    allow_credentials=True,

    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],

    allow_headers=["*"],
)


# ============================================================
# REGISTER ROUTERS
# ============================================================

app.include_router(auth_router)

app.include_router(donor_router)

app.include_router(request_router)

app.include_router(match_router)

app.include_router(dashboard_router)

app.include_router(notification_router)


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return {
        "message": "BloodBridge API is running",
        "version": "2.0.0",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",

        "project": "BloodBridge",

        "features": [
            "authentication",
            "donor profiles",
            "blood requests",
            "GPS matching",
            "distance calculation",
            "nearest donor matching",
            "nearest request selection",
            "notifications",
            "privacy-first donor contact",
        ],
    }