from fastapi import FastAPI

from app.core.config import settings
from app.routers.health import router as health_router

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Caduceus — intelligent nutrition assistant API",
)

app.include_router(health_router)