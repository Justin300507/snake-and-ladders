from fastapi import FastAPI
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db

# Import all models to ensure they are registered with SQLAlchemy Base.metadata
from app.models.player_states import *  # noqa: F401
from app.models.users import *  # noqa: F401
from app.models.games import *  # noqa: F401

# Import routers
from app.routes.stats_routes import stats_router
from app.routes.user_routes import user_router
from app.routes.seed_routes import seed_router
from app.routes.game_routes import game_router
from app.routes.auth_routes import auth_router

app = FastAPI()

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create all tables defined in models
Base.metadata.create_all(bind=engine)

# CORS (required for frontend access)
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health endpoint (required for deployment health checks)
@app.get("/health")
def health():
    return {"status": "ok"}

# Include routers
app.include_router(stats_router)
app.include_router(user_router)
app.include_router(seed_router)
app.include_router(game_router)
app.include_router(auth_router)
