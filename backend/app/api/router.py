from fastapi import APIRouter

from app.api import admin, auth, booking, directory, emergency, screening

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(directory.router)
api_router.include_router(booking.router)
api_router.include_router(screening.router)
api_router.include_router(emergency.router)
api_router.include_router(admin.router)
