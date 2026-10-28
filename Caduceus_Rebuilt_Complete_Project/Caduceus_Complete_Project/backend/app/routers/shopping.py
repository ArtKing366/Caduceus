from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ShoppingList, ShoppingListItem
from app.schemas import ShoppingListIn, ShoppingListOut, ShoppingItemIn, ShoppingItemOut
from app.security import get_current_user
router = APIRouter(prefix="/shopping-lists", tags=["Shopping lists"])
@router.get("", response_model=list[ShoppingListOut])
def lists(user=Depends(get_current_user), db: Session=Depends(get_db)):
    return list(db.scalars(select(ShoppingList).where(ShoppingList.user_id==user.id).order_by(ShoppingList.created_at.desc())))
@router.post("", response_model=ShoppingListOut, status_code=201)
def create_list(payload: ShoppingListIn, user=Depends(get_current_user), db: Session=Depends(get_db)):
    item=ShoppingList(user_id=user.id, name=payload.name)
    db.add(item); db.commit(); db.refresh(item); return item
@router.get("/{list_id}/items", response_model=list[ShoppingItemOut])
def items(list_id: int, user=Depends(get_current_user), db: Session=Depends(get_db)):
    shopping=db.scalar(select(ShoppingList).where(ShoppingList.id==list_id, ShoppingList.user_id==user.id))
    if not shopping: raise HTTPException(404, "Shopping list not found")
    return list(db.scalars(select(ShoppingListItem).where(ShoppingListItem.shopping_list_id==list_id)))
@router.post("/{list_id}/items", response_model=ShoppingItemOut, status_code=201)
def add_item(list_id: int, payload: ShoppingItemIn, user=Depends(get_current_user), db: Session=Depends(get_db)):
    shopping=db.scalar(select(ShoppingList).where(ShoppingList.id==list_id, ShoppingList.user_id==user.id))
    if not shopping: raise HTTPException(404, "Shopping list not found")
    item=ShoppingListItem(shopping_list_id=list_id, **payload.model_dump())
    db.add(item); db.commit(); db.refresh(item); return item
@router.patch("/{list_id}/items/{item_id}/check", response_model=ShoppingItemOut)
def toggle_item(list_id: int, item_id: int, user=Depends(get_current_user), db: Session=Depends(get_db)):
    shopping=db.scalar(select(ShoppingList).where(ShoppingList.id==list_id, ShoppingList.user_id==user.id))
    if not shopping: raise HTTPException(404, "Shopping list not found")
    item=db.scalar(select(ShoppingListItem).where(ShoppingListItem.id==item_id, ShoppingListItem.shopping_list_id==list_id))
    if not item: raise HTTPException(404, "Item not found")
    item.is_checked=not item.is_checked; db.commit(); db.refresh(item); return item
