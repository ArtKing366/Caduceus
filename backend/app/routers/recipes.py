from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Recipe
from app.schemas import RecipeOut
router = APIRouter(prefix="/recipes", tags=["Recipes"])
@router.get("", response_model=list[RecipeOut])
def recipes(q: str | None = None, tag: str | None = None, db: Session = Depends(get_db)):
    stmt=select(Recipe)
    if q: stmt=stmt.where(Recipe.name.ilike(f"%{q}%"))
    items=list(db.scalars(stmt.order_by(Recipe.name)))
    if tag: items=[r for r in items if tag.lower() in [x.lower() for x in r.dietary_tags]]
    return items
@router.get("/{recipe_id}", response_model=RecipeOut)
def recipe_detail(recipe_id: int, db: Session = Depends(get_db)):
    item=db.get(Recipe, recipe_id)
    if not item: raise HTTPException(404, "Recipe not found")
    return item
