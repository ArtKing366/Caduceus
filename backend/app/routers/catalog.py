import json
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Restaurant, Dish, Ingredient, Recipe, Store, Product, StoreCatalogItem
from app.schemas import CatalogImportResult
from app.security import get_current_user
router = APIRouter(prefix="/catalog", tags=["Catalog and JSON import"])
@router.post("/import-json", response_model=CatalogImportResult)
async def import_json(file: UploadFile = File(...), user=Depends(get_current_user), db: Session=Depends(get_db)):
    if not file.filename or Path(file.filename).suffix.lower() != ".json":
        raise HTTPException(400, "Upload a .json file")
    if file.size and file.size > 5_000_000:
        raise HTTPException(413, "JSON file must be smaller than 5 MB")
    try:
        payload=json.loads((await file.read()).decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        raise HTTPException(400, "Invalid UTF-8 JSON")
    if not isinstance(payload, dict):
        raise HTTPException(400, "JSON root must be an object")
    counts={k:0 for k in ["restaurants","dishes","ingredients","recipes","stores","products"]}
    try:
        for row in payload.get("restaurants", []):
            obj=db.scalar(select(Restaurant).where(Restaurant.code==row["code"]))
            if obj is None: obj=Restaurant(code=row["code"], name=row["name"]); db.add(obj); counts["restaurants"]+=1
            for k in ["name","description","category","address","city","latitude","longitude","is_active"]:
                if k in row: setattr(obj,k,row[k])
        db.flush()
        for row in payload.get("ingredients", []):
            obj=db.scalar(select(Ingredient).where(Ingredient.code==row["code"]))
            if obj is None: obj=Ingredient(code=row["code"], name=row["name"]); db.add(obj); counts["ingredients"]+=1
            for k in ["name","unit","calories_per_100","protein_per_100","fat_per_100","carbs_per_100","allergens"]:
                if k in row: setattr(obj,k,row[k])
        for row in payload.get("dishes", []):
            restaurant=db.scalar(select(Restaurant).where(Restaurant.code==row["restaurant_code"]))
            if not restaurant: raise ValueError(f"Unknown restaurant_code: {row['restaurant_code']}")
            obj=db.scalar(select(Dish).where(Dish.code==row["code"]))
            if obj is None: obj=Dish(code=row["code"], name=row["name"], restaurant_id=restaurant.id); db.add(obj); counts["dishes"]+=1
            for k in ["name","description","category","price_pln","serving_grams","calories","protein","fat","carbs","dietary_tags","allergens"]:
                if k in row: setattr(obj,k,row[k])
        for row in payload.get("recipes", []):
            obj=db.scalar(select(Recipe).where(Recipe.code==row["code"]))
            if obj is None: obj=Recipe(code=row["code"], name=row["name"]); db.add(obj); counts["recipes"]+=1
            for k in ["name","description","instructions","servings","prep_minutes","dietary_tags"]:
                if k in row: setattr(obj,k,row[k])
        for row in payload.get("stores", []):
            obj=db.scalar(select(Store).where(Store.code==row["code"]))
            if obj is None: obj=Store(code=row["code"], name=row["name"]); db.add(obj); counts["stores"]+=1
            for k in ["name","address","city","latitude","longitude"]:
                if k in row: setattr(obj,k,row[k])
        db.flush()
        for row in payload.get("products", []):
            obj=db.scalar(select(Product).where(Product.code==row["code"]))
            if obj is None: obj=Product(code=row["code"], name=row["name"]); db.add(obj); counts["products"]+=1
            for k in ["name","category","unit","pack_quantity","pack_unit","calories_per_100","protein_per_100","fat_per_100","carbs_per_100"]:
                if k in row: setattr(obj,k,row[k])
        db.flush()
        for row in payload.get("store_catalog_items", []):
            store=db.scalar(select(Store).where(Store.code==row["store_code"]))
            product=db.scalar(select(Product).where(Product.code==row["product_code"]))
            if not store or not product: raise ValueError("store_catalog_items reference unknown store_code or product_code")
            obj=db.scalar(select(StoreCatalogItem).where(StoreCatalogItem.store_id==store.id, StoreCatalogItem.product_id==product.id))
            if obj is None: obj=StoreCatalogItem(store_id=store.id, product_id=product.id, price_pln=row["price_pln"]); db.add(obj)
            obj.price_pln=row["price_pln"]; obj.available=row.get("available", True)
        db.commit()
    except (KeyError, ValueError, TypeError) as exc:
        db.rollback()
        raise HTTPException(422, f"Catalog import failed: {exc}")
    return CatalogImportResult(**counts)
