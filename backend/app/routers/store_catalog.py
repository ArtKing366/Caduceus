from fastapi import APIRouter, Depends
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Product, Store, StoreCatalogItem

router = APIRouter(prefix="/store-catalog", tags=["Store catalog"])


@router.get("")
def list_store_catalog(
    q: str = "",
    category: str = "",
    store: str = "",
    sort: str = "default",
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    safe_limit = max(1, min(limit, 500))
    safe_offset = max(0, offset)

    filters = []
    if q.strip():
        for word in q.strip().split():
            pattern = f"%{word}%"
            filters.append(
                or_(
                    Product.name.ilike(pattern),
                    Product.code.ilike(pattern),
                    Product.category.ilike(pattern),
                )
            )
    if category.strip():
        filters.append(Product.category.ilike(category.strip()))
    if store.strip():
        pattern = f"%{store.strip()}%"
        filters.append(or_(Store.name.ilike(pattern), Store.address.ilike(pattern)))

    count_stmt = (
        select(func.count(StoreCatalogItem.id))
        .select_from(StoreCatalogItem)
        .join(Product, StoreCatalogItem.product_id == Product.id)
        .join(Store, StoreCatalogItem.store_id == Store.id)
        .where(*filters)
    )
    total = db.scalar(count_stmt) or 0

    order_clauses = [StoreCatalogItem.id.asc()]
    if sort == "price_asc":
        order_clauses = [StoreCatalogItem.price_pln.asc(), StoreCatalogItem.id.asc()]
    elif sort == "price_desc":
        order_clauses = [StoreCatalogItem.price_pln.desc(), StoreCatalogItem.id.asc()]

    stmt = (
        select(StoreCatalogItem, Product, Store)
        .join(Product, StoreCatalogItem.product_id == Product.id)
        .join(Store, StoreCatalogItem.store_id == Store.id)
        .where(*filters)
        .order_by(*order_clauses)
        .offset(safe_offset)
        .limit(safe_limit)
    )
    rows = db.execute(stmt).all()

    return {
        "total": total,
        "offset": safe_offset,
        "limit": safe_limit,
        "items": [
            {
                "id": sci.id,
                "price_pln": sci.price_pln,
                "available": sci.available,
                "product": {
                    "id": prod.id,
                    "code": prod.code,
                    "name": prod.name,
                    "category": prod.category,
                    "unit": prod.unit,
                    "pack_quantity": prod.pack_quantity,
                    "pack_unit": prod.pack_unit,
                    "calories_per_100": prod.calories_per_100,
                    "protein_per_100": prod.protein_per_100,
                    "fat_per_100": prod.fat_per_100,
                    "carbs_per_100": prod.carbs_per_100,
                },
                "store": {
                    "id": st.id,
                    "code": st.code,
                    "name": st.name,
                    "address": st.address,
                    "city": st.city,
                },
            }
            for sci, prod, st in rows
        ],
    }
