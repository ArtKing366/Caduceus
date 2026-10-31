from math import radians, sin, cos, sqrt, atan2
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, or_
from sqlalchemy.orm import Session, selectinload
from app.database import get_db
from app.models import Restaurant, Dish
from app.schemas import RestaurantOut, DishOut
router = APIRouter(tags=["Restaurant explorer"])
def distance_km(lat1, lon1, lat2, lon2):
    r=6371.0
    dlat=radians(lat2-lat1); dlon=radians(lon2-lon1)
    a=sin(dlat/2)**2+cos(radians(lat1))*cos(radians(lat2))*sin(dlon/2)**2
    return 2*r*atan2(sqrt(a),sqrt(1-a))
@router.get("/restaurants", response_model=list[RestaurantOut])
def search_restaurants(q: str | None = None, category: str | None = None, city: str = "Łódź",
                       db: Session = Depends(get_db)):
    stmt=select(Restaurant).where(Restaurant.is_active.is_(True), Restaurant.city.ilike(f"%{city}%"))
    if q: stmt=stmt.where(or_(Restaurant.name.ilike(f"%{q}%"), Restaurant.description.ilike(f"%{q}%")))
    if category: stmt=stmt.where(Restaurant.category.ilike(f"%{category}%"))
    return list(db.scalars(stmt.order_by(Restaurant.name)))
@router.get("/restaurants/nearby", response_model=list[RestaurantOut])
def nearby(latitude: float, longitude: float, radius_km: float = Query(default=5, ge=0.1, le=100),
           db: Session = Depends(get_db)):
    candidates=list(db.scalars(select(Restaurant).where(Restaurant.is_active.is_(True),
        Restaurant.latitude.is_not(None), Restaurant.longitude.is_not(None))))
    return [r for r in candidates if distance_km(latitude, longitude, r.latitude, r.longitude) <= radius_km]
@router.get("/restaurants/{restaurant_id}", response_model=RestaurantOut)
def restaurant_detail(restaurant_id: int, db: Session = Depends(get_db)):
    from fastapi import HTTPException
    item=db.get(Restaurant, restaurant_id)
    if not item: raise HTTPException(404, "Restaurant not found")
    return item
@router.get("/restaurants/{restaurant_id}/dishes", response_model=list[DishOut])
def restaurant_dishes(restaurant_id: int, category: str | None = None, q: str | None = None,
                      db: Session = Depends(get_db)):
    stmt=select(Dish).where(Dish.restaurant_id == restaurant_id)
    if category: stmt=stmt.where(Dish.category.ilike(f"%{category}%"))
    if q: stmt=stmt.where(Dish.name.ilike(f"%{q}%"))
    return list(db.scalars(stmt.order_by(Dish.name)))
@router.get("/dishes", response_model=list[DishOut])
def search_dishes(q: str | None = None, category: str | None = None, max_price: float | None = None,
                  max_calories: float | None = None, db: Session = Depends(get_db)):
    stmt=select(Dish)
    if q: stmt=stmt.where(Dish.name.ilike(f"%{q}%"))
    if category: stmt=stmt.where(Dish.category.ilike(f"%{category}%"))
    if max_price is not None: stmt=stmt.where(Dish.price_pln <= max_price)
    if max_calories is not None: stmt=stmt.where(Dish.calories <= max_calories)
    return list(db.scalars(stmt.order_by(Dish.name)))
