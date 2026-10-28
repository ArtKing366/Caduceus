from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import DietaryPreference, User
from app.schemas import PreferenceIn, PreferenceOut, UserOut
from app.security import get_current_user
router = APIRouter(prefix="/profile", tags=["Profile and dietary preferences"])
@router.get("", response_model=UserOut)
def get_profile(user: User = Depends(get_current_user)): return user
@router.get("/preferences", response_model=list[PreferenceOut])
def list_preferences(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return list(db.scalars(select(DietaryPreference).where(DietaryPreference.user_id == user.id)))
@router.post("/preferences", response_model=PreferenceOut, status_code=201)
def add_preference(payload: PreferenceIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pref = payload.preference.strip().lower()
    existing = db.scalar(select(DietaryPreference).where(DietaryPreference.user_id == user.id, DietaryPreference.preference == pref))
    if existing: raise HTTPException(409, "Preference already exists")
    item = DietaryPreference(user_id=user.id, preference=pref, strict=payload.strict)
    db.add(item); db.commit(); db.refresh(item); return item
@router.delete("/preferences/{preference_id}", status_code=204)
def delete_preference(preference_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.scalar(select(DietaryPreference).where(DietaryPreference.id == preference_id, DietaryPreference.user_id == user.id))
    if not item: raise HTTPException(404, "Preference not found")
    db.delete(item); db.commit()
