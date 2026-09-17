import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine

# Import models so SQLAlchemy knows all tables
from models.user import User
from models.donor import DonorProfile
from models.blood_request import BloodRequest
from models.match import Match

# Import routers
from routes.auth import router as auth_router
from routes.donors import router as donor_router
from routes.requests import router as request_router
from routes.matches import router as match_router
from routes.dashboard import router as dashboard_router


# =========================================================
# CREATE DATABASE TABLES
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="BloodBridge API",
    description="Privacy-first blood donor matching platform",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

# Production React frontend URL from Render environment variable
frontend_url = os.getenv("FRONTEND_URL")


# Allow local frontend during development
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


# Add deployed React frontend URL
if frontend_url:
    allowed_origins.append(
        frontend_url.rstrip("/")
    )


app.add_middleware(
    CORSMiddleware,

    allow_origins=allowed_origins,

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================================
# ROUTERS
# =========================================================

app.include_router(auth_router)

app.include_router(donor_router)

app.include_router(request_router)

app.include_router(match_router)

app.include_router(dashboard_router)


# =========================================================
# BASIC ROUTES
# =========================================================

@app.get("/")
def home():
    return {
        "message": "BloodBridge API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "project": "BloodBridge"
    }