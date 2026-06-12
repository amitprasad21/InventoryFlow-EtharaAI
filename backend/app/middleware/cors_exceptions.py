from fastapi import Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
import logging

# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("inventoryflow-api")

async def integrity_exception_handler(request: Request, exc: IntegrityError):
    logger.error(f"Database integrity error: {str(exc)}")
    
    # Check for duplicate key violations
    error_msg = str(exc.orig) if exc.orig else str(exc)
    detail = "Database integrity violation occurred."
    
    if "unique constraint" in error_msg.lower() or "duplicate key" in error_msg.lower():
        detail = "A record with these unique identifiers already exists."
        
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": detail},
    )

async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception occurred: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please contact the administrator."},
    )
