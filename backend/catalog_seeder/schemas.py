from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class RestaurantIn(BaseModel):
    code: str = Field(..., min_length=1, max_length=80)
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = "Łódź"
    latitude: Optional[float] = Field(default=None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(default=None, ge=-180.0, le=180.0)
    is_active: bool = True


class IngredientIn(BaseModel):
    code: str = Field(..., min_length=1, max_length=80)
    name: str = Field(..., min_length=1, max_length=255)
    unit: str = "g"
    calories_per_100: float = Field(..., ge=0)
    protein_per_100: float = Field(..., ge=0)
    fat_per_100: float = Field(..., ge=0)
    carbs_per_100: float = Field(..., ge=0)
    allergens: List[str] = Field(default_factory=list)


class DishIn(BaseModel):
    code: str = Field(..., min_length=1, max_length=80)
    restaurant_code: str = Field(..., min_length=1, max_length=80)
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = "main"
    price_pln: Optional[float] = Field(default=None, gt=0)
    serving_grams: Optional[int] = Field(default=None, gt=0)
    calories: Optional[float] = Field(default=None, ge=0)
    protein: Optional[float] = Field(default=None, ge=0)
    fat: Optional[float] = Field(default=None, ge=0)
    carbs: Optional[float] = Field(default=None, ge=0)
    dietary_tags: List[str] = Field(default_factory=list)
    allergens: List[str] = Field(default_factory=list)


class RecipeIn(BaseModel):
    code: str = Field(..., min_length=1, max_length=80)
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    instructions: List[str] = Field(default_factory=list)
    servings: Optional[int] = Field(default=1, gt=0)
    prep_minutes: Optional[int] = Field(default=None, gt=0)
    dietary_tags: List[str] = Field(default_factory=list)


class StoreIn(BaseModel):
    code: str = Field(..., min_length=1, max_length=80)
    name: str = Field(..., min_length=1, max_length=255)
    address: Optional[str] = None
    city: Optional[str] = "Łódź"
    latitude: Optional[float] = Field(default=None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(default=None, ge=-180.0, le=180.0)


class ProductIn(BaseModel):
    code: str = Field(..., min_length=1, max_length=80)
    name: str = Field(..., min_length=1, max_length=255)
    category: Optional[str] = None
    unit: str = "g"
    pack_quantity: Optional[float] = Field(default=None, gt=0)
    pack_unit: Optional[str] = None
    calories_per_100: Optional[float] = Field(default=None, ge=0)
    protein_per_100: Optional[float] = Field(default=None, ge=0)
    fat_per_100: Optional[float] = Field(default=None, ge=0)
    carbs_per_100: Optional[float] = Field(default=None, ge=0)


class StoreCatalogItemIn(BaseModel):
    store_code: str = Field(..., min_length=1, max_length=80)
    product_code: str = Field(..., min_length=1, max_length=80)
    price_pln: float = Field(..., gt=0)
    available: bool = True


class CatalogPayload(BaseModel):
    """Top-level payload contract for POST /catalog/import-json."""

    restaurants: List[RestaurantIn] = Field(default_factory=list)
    ingredients: List[IngredientIn] = Field(default_factory=list)
    dishes: List[DishIn] = Field(default_factory=list)
    recipes: List[RecipeIn] = Field(default_factory=list)
    stores: List[StoreIn] = Field(default_factory=list)
    products: List[ProductIn] = Field(default_factory=list)
    store_catalog_items: List[StoreCatalogItemIn] = Field(default_factory=list)

    @field_validator("restaurants", "ingredients", "dishes", "recipes", "stores", "products")
    @classmethod
    def ensure_unique_codes(cls, items: list) -> list:
        seen = set()
        unique_items = []
        for item in items:
            if item.code not in seen:
                seen.add(item.code)
                unique_items.append(item)
        return unique_items