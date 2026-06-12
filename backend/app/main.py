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
frontend_url_env = os.getenv("FRONTEND_API_URL", "")
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:8000",
]
if frontend_url_env:
    for url in frontend_url_env.split(","):
        cleaned = url.strip().rstrip("/")
        if cleaned and cleaned not in origins:
            origins.append(cleaned)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app|https://.*\.onrender\.com|http://localhost(:\d+)?|http://127\.0\.0\.1(:\d+)?",
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
