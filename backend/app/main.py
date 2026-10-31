from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, profile, restaurants, nutrition, recipes, shopping, catalog, food_scan
app = FastAPI(title="Caduceus API", version="1.0.0",
              description="Nutrition assistant API. Demo catalog data is not bundled.")
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origin_list,
                   allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
for router in [auth.router, profile.router, restaurants.router, nutrition.router, recipes.router, shopping.router, catalog.router, food_scan.router]:
    app.include_router(router)
@app.get("/health", tags=["System"])
def health():
    return {"status":"ok","service":"caduceus-api"}
