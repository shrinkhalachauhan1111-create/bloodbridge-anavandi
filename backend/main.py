from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine

from models.user import User
from models.donor import DonorProfile
from models.blood_request import BloodRequest
from models.match import Match

from routes.auth import router as auth_router
from routes.donors import router as donor_router
from routes.requests import router as request_router
from routes.matches import router as match_router
from routes.dashboard import router as dashboard_router


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="BloodBridge API",
    description="Privacy-first blood donor matching platform",
    version="1.0.0"
)


# Allow React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(donor_router)
app.include_router(request_router)
app.include_router(match_router)
app.include_router(dashboard_router)


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