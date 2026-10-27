from fastapi import FastAPI

from app.core.config import settings
from app.routers.health import router as health_router
from app.routers.auth import router as auth_router
from app.routers.preferences import router as preferences_router
app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Caduceus — intelligent nutrition assistant API",
)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(preferences_router)
