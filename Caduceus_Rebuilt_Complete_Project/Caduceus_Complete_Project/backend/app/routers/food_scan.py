import base64
import json
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from openai import OpenAI
from app.config import settings
from app.database import get_db
from app.models import FoodScanSession, MealEntry, User
from app.security import get_current_user

router = APIRouter(prefix="/food-scan", tags=["AI food photo scan"])
MAX_IMAGE_BYTES = 8 * 1024 * 1024
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}

class ConfirmScanIn(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    meal_type: str = Field(default="other", max_length=40)
    serving_grams: float = Field(default=0, ge=0, le=10000)
    calories: float = Field(ge=0, le=20000)
    protein: float = Field(default=0, ge=0, le=2000)
    fat: float = Field(default=0, ge=0, le=2000)
    carbs: float = Field(default=0, ge=0, le=3000)

@router.post("/analyze", status_code=201)
async def analyze_food_photo(
    image: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if image.content_type not in ALLOWED_TYPES:
        raise HTTPException(415, "Upload a JPEG, PNG, or WebP image")
    raw = await image.read(MAX_IMAGE_BYTES + 1)
    if not raw:
        raise HTTPException(400, "Uploaded image is empty")
    if len(raw) > MAX_IMAGE_BYTES:
        raise HTTPException(413, "Image must be 8 MB or smaller")
    if not settings.openai_api_key:
        raise HTTPException(503, "Food photo analysis is not configured. Set OPENAI_API_KEY on the backend.")

    mime = image.content_type
    encoded = base64.b64encode(raw).decode("ascii")
    client = OpenAI(api_key=settings.openai_api_key)
    prompt = (
        "Estimate the visible food and nutrition. Return only JSON with keys: name, serving_grams, "
        "calories, protein, fat, carbs, confidence, notes. Use numeric values for nutrition, "
        "confidence between 0 and 1, and notes as a short string. These are uncertain estimates; "
        "do not claim exact measurements. If food is unclear, say so in notes and use conservative estimates."
    )
    try:
        response = client.chat.completions.create(
            model=settings.openai_vision_model,
            response_format={"type": "json_object"},
            messages=[{"role": "user", "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{encoded}"}},
            ]}],
            max_tokens=500,
        )
        result = json.loads(response.choices[0].message.content or "{}")
    except Exception as exc:
        raise HTTPException(502, "Food image analysis failed. Try again or enter the meal manually.") from exc

    record = FoodScanSession(
        user_id=user.id,
        image_reference=image.filename or "uploaded-image",
        status="needs_confirmation",
        result_json=result,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return {"scan_id": record.id, "status": record.status, "estimate": result,
            "notice": "AI nutrition values are estimates. Review and correct them before adding to your diary."}

@router.post("/{scan_id}/confirm", status_code=201)
def confirm_food_scan(
    scan_id: int,
    payload: ConfirmScanIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = db.query(FoodScanSession).filter_by(id=scan_id, user_id=user.id).first()
    if record is None:
        raise HTTPException(404, "Food scan not found")
    if record.status == "confirmed":
        raise HTTPException(409, "Food scan has already been confirmed")
    meal = MealEntry(user_id=user.id, **payload.model_dump())
    record.status = "confirmed"
    db.add(meal)
    db.commit()
    db.refresh(meal)
    return {"meal_id": meal.id, "scan_id": record.id, "status": "confirmed", "meal": {
        "name": meal.name, "serving_grams": meal.serving_grams, "calories": meal.calories,
        "protein": meal.protein, "fat": meal.fat, "carbs": meal.carbs,
    }}
