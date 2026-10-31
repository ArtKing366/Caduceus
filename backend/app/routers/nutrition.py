from datetime import date, datetime, time, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import MealEntry
from app.schemas import MealIn, MealOut, NutritionSummary
from app.security import get_current_user
router = APIRouter(prefix="/nutrition", tags=["Food diary and nutrition"])
@router.get("/meals", response_model=list[MealOut])
def list_meals(day: date | None = None, user=Depends(get_current_user), db: Session = Depends(get_db)):
    stmt=select(MealEntry).where(MealEntry.user_id == user.id)
    if day:
        start=datetime.combine(day,time.min).replace(tzinfo=timezone.utc)
        end=start+timedelta(days=1)
        stmt=stmt.where(MealEntry.eaten_at >= start, MealEntry.eaten_at < end)
    return list(db.scalars(stmt.order_by(MealEntry.eaten_at.desc())))
@router.post("/meals", response_model=MealOut, status_code=201)
def add_meal(payload: MealIn, user=Depends(get_current_user), db: Session = Depends(get_db)):
    data=payload.model_dump(exclude_unset=True)
    if data.get("eaten_at") is None: data["eaten_at"]=datetime.now(timezone.utc)
    item=MealEntry(user_id=user.id, **data)
    db.add(item); db.commit(); db.refresh(item); return item
@router.patch("/meals/{meal_id}", response_model=MealOut)
def update_meal(meal_id: int, payload: MealIn, user=Depends(get_current_user), db: Session = Depends(get_db)):
    item=db.scalar(select(MealEntry).where(MealEntry.id == meal_id, MealEntry.user_id == user.id))
    if not item: raise HTTPException(404, "Meal entry not found")
    for k,v in payload.model_dump(exclude_unset=True).items(): setattr(item,k,v)
    db.commit(); db.refresh(item); return item
@router.delete("/meals/{meal_id}", status_code=204)
def delete_meal(meal_id: int, user=Depends(get_current_user), db: Session = Depends(get_db)):
    item=db.scalar(select(MealEntry).where(MealEntry.id == meal_id, MealEntry.user_id == user.id))
    if not item: raise HTTPException(404, "Meal entry not found")
    db.delete(item); db.commit()
@router.get("/summary", response_model=NutritionSummary)
def summary(day: date | None = None, user=Depends(get_current_user), db: Session = Depends(get_db)):
    day=day or date.today()
    start=datetime.combine(day,time.min).replace(tzinfo=timezone.utc); end=start+timedelta(days=1)
    items=list(db.scalars(select(MealEntry).where(MealEntry.user_id==user.id, MealEntry.eaten_at>=start, MealEntry.eaten_at<end)))
    return NutritionSummary(date=day.isoformat(), calories=sum(x.calories for x in items),
        protein=sum(x.protein for x in items), fat=sum(x.fat for x in items), carbs=sum(x.carbs for x in items))
