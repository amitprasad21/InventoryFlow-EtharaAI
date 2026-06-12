from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError
from app.core.config import settings
from app.api.endpoints import router as api_router
from app.middleware.cors_exceptions import integrity_exception_handler, global_exception_handler
from app.database.session import SessionLocal
from app.database.init_db import seed_db
from fastapi.staticfiles import StaticFiles
import os
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs on startup: Create tables & seed
    db = SessionLocal()
    try:
        seed_db(db)
    except Exception as e:
        print(f"Error seeding database on startup: {str(e)}")
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure static directory exists
os.makedirs("static", exist_ok=True)
# Mount static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# Custom Exception Handlers
app.add_exception_handler(IntegrityError, integrity_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

# Include all API v1 endpoints
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "InventoryFlow AI Backend API",
        "documentation": "/docs"
    }
