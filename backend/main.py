from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# =========================================================
# ROUTERS
# =========================================================

from routes.auth import router as auth_router
from routes.donors import router as donor_router
from routes.requests import router as request_router
from routes.matches import router as match_router
from routes.dashboard import router as dashboard_router
from routes.notifications import router as notification_router


# =========================================================
# CREATE FASTAPI APP
# =========================================================

app = FastAPI(
    title="BloodBridge API",
    description="Blood donor matching and emergency blood request API",
    version="2.0.0"
)


# =========================================================
# CORS
# =========================================================
#
# React is running on:
#
# http://localhost:5173
#
# FastAPI is running on:
#
# http://127.0.0.1:8000
#
# The browser treats these as different origins.
# Therefore we must explicitly allow the React frontend.
# =========================================================

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


app.add_middleware(
    CORSMiddleware,

    allow_origins=origins,

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================================
# INCLUDE ROUTERS
# =========================================================

app.include_router(
    auth_router
)

app.include_router(
    donor_router
)

app.include_router(
    request_router
)

app.include_router(
    match_router
)

app.include_router(
    dashboard_router
)

app.include_router(
    notification_router
)


# =========================================================
# ROOT ROUTE
# =========================================================

@app.get("/")
def root():
    return {
        "message": "BloodBridge API is running",
        "version": "2.0.0"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }