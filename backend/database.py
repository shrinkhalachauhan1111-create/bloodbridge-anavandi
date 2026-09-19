import os

from dotenv import load_dotenv

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()


DATABASE_URL = os.getenv("DATABASE_URL")


if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set in .env"
    )


# ============================================================
# NORMALIZE POSTGRES URL
# ============================================================

# Render / Neon may sometimes provide:
# postgresql://...
#
# Our project uses psycopg 3:
# postgresql+psycopg://...

if DATABASE_URL.startswith("postgresql://"):

    DATABASE_URL = DATABASE_URL.replace(
        "postgresql://",
        "postgresql+psycopg://",
        1
    )


elif DATABASE_URL.startswith("postgres://"):

    DATABASE_URL = DATABASE_URL.replace(
        "postgres://",
        "postgresql+psycopg://",
        1
    )


# ============================================================
# DATABASE ENGINE
# ============================================================

engine = create_engine(

    DATABASE_URL,

    # Checks whether an existing connection is still alive.
    # Useful for Neon / Render.
    pool_pre_ping=True,

    # Recycle old connections.
    pool_recycle=300,

    # Don't wait forever for a connection from the pool.
    pool_timeout=10,

    # Don't wait forever when Neon cannot be reached.
    connect_args={
        "connect_timeout": 10
    },
)


# ============================================================
# DATABASE SESSION
# ============================================================

SessionLocal = sessionmaker(

    autocommit=False,

    autoflush=False,

    bind=engine
)


# ============================================================
# SQLALCHEMY BASE
# ============================================================

Base = declarative_base()


# ============================================================
# FASTAPI DATABASE DEPENDENCY
# ============================================================

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()