from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=120)
class LoginIn(BaseModel):
    email: EmailStr
    password: str
class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: EmailStr
    full_name: str | None
class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
class PreferenceIn(BaseModel):
    preference: str = Field(min_length=1, max_length=80)
    strict: bool = False
class PreferenceOut(PreferenceIn):
    model_config = ConfigDict(from_attributes=True)
    id: int
class RestaurantOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    code: str
    name: str
    description: str | None
    category: str | None
    address: str | None
    city: str
    latitude: float | None
    longitude: float | None
class DishOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    code: str
    restaurant_id: int
    name: str
    description: str | None
    category: str | None
    price_pln: float
    serving_grams: float
    calories: float
    protein: float
    fat: float
    carbs: float
    dietary_tags: list[str]
    allergens: list[str]
class MealIn(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    meal_type: str = "other"
    eaten_at: datetime | None = None
    serving_grams: float = Field(default=0, ge=0)
    calories: float = Field(default=0, ge=0)
    protein: float = Field(default=0, ge=0)
    fat: float = Field(default=0, ge=0)
    carbs: float = Field(default=0, ge=0)
    notes: str | None = None
class MealOut(MealIn):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
class NutritionSummary(BaseModel):
    date: str
    calories: float
    protein: float
    fat: float
    carbs: float
class RecipeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    code: str
    name: str
    description: str | None
    instructions: list[str]
    servings: int
    prep_minutes: int
    dietary_tags: list[str]
class ShoppingListIn(BaseModel):
    name: str = Field(min_length=1, max_length=160)
class ShoppingListOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    name: str
    created_at: datetime
class ShoppingItemIn(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    product_id: int | None = None
    quantity: float = Field(default=1, gt=0)
    unit: str = "pcs"
    estimated_price_pln: float = Field(default=0, ge=0)
class ShoppingItemOut(ShoppingItemIn):
    model_config = ConfigDict(from_attributes=True)
    id: int
    shopping_list_id: int
    is_checked: bool
class CatalogImportResult(BaseModel):
    restaurants: int
    dishes: int
    ingredients: int
    recipes: int
    stores: int
    products: int
