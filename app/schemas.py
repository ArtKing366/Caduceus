"""Pydantic v2 schemas for the Caduceus API.

These schemas validate API input and shape API responses. They do not create
or modify PostgreSQL tables; SQLAlchemy models remain in app/models.py.
"""

from __future__ import annotations

import re
from datetime import datetime
from decimal import Decimal
from typing import Any, Literal

from pydantic import AliasChoices, BaseModel, ConfigDict, Field, field_validator, model_validator


# ---------------------------------------------------------------------------
# Shared schema configuration and common types
# ---------------------------------------------------------------------------


class ORMModel(BaseModel):
    """Base for response schemas validated from SQLAlchemy ORM objects."""

    model_config = ConfigDict(from_attributes=True)


PreferenceType = Literal["diet", "allergy", "restriction"]
MealType = Literal["breakfast", "lunch", "dinner", "snack", "other"]
AvailabilityStatus = Literal["available", "unavailable", "unknown"]
FoodScanStatus = Literal["pending", "processing", "completed", "failed", "confirmed"]
NutritionBasis = Literal["g", "ml"]
BudgetLevel = Literal["budget", "standard", "premium"]
IngredientUnit = Literal["g", "kg", "ml", "l", "piece", "slice", "tbsp", "tsp", "cup", "portion"]


class MessageResponse(BaseModel):
    message: str


class ErrorResponse(BaseModel):
    detail: str


class NutritionValues(BaseModel):
    """Nutritional values; values are non-negative when known."""

    calories: Decimal | None = Field(default=None, ge=0)
    protein: Decimal | None = Field(default=None, ge=0)
    fat: Decimal | None = Field(default=None, ge=0)
    carbohydrates: Decimal | None = Field(default=None, ge=0)


# ---------------------------------------------------------------------------
# 1. Users and authentication
# ---------------------------------------------------------------------------


class UserRegister(BaseModel):
    full_name: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=3, max_length=255, pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
    password: str = Field(min_length=8, max_length=128)

    @field_validator("full_name")
    @classmethod
    def strip_full_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Full name cannot be empty.")
        return value

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class UserLogin(BaseModel):
    email: str = Field(min_length=3, max_length=255, pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=120)

    @field_validator("full_name")
    @classmethod
    def strip_full_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("Full name cannot be empty.")
        return value


class UserRead(ORMModel):
    id: int
    full_name: str
    email: str
    is_active: bool
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead | None = None


# ---------------------------------------------------------------------------
# 2. Dietary preferences, allergies, and restrictions
# ---------------------------------------------------------------------------


class DietaryPreferenceCreate(BaseModel):
    preference_type: PreferenceType
    preference: str = Field(min_length=1, max_length=100)
    is_strict: bool = False
    notes: str | None = None

    @field_validator("preference")
    @classmethod
    def strip_preference(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Preference cannot be empty.")
        return value


class DietaryPreferenceUpdate(BaseModel):
    preference_type: PreferenceType | None = None
    preference: str | None = Field(default=None, min_length=1, max_length=100)
    is_strict: bool | None = None
    notes: str | None = None

    @field_validator("preference")
    @classmethod
    def strip_preference(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("Preference cannot be empty.")
        return value


class DietaryPreferenceRead(ORMModel):
    id: int
    user_id: int
    preference_type: PreferenceType
    preference: str
    is_strict: bool
    notes: str | None = None
    created_at: datetime


# ---------------------------------------------------------------------------
# 3. Restaurants
# ---------------------------------------------------------------------------


class RestaurantCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str | None = None
    cuisine: str | None = Field(default=None, max_length=100)
    address: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, max_length=100)
    image_url: str | None = Field(default=None, max_length=1000)
    is_demo: bool = True

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Restaurant name cannot be empty.")
        return value


class RestaurantUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    cuisine: str | None = Field(default=None, max_length=100)
    address: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, max_length=100)
    image_url: str | None = Field(default=None, max_length=1000)
    is_demo: bool | None = None

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("Restaurant name cannot be empty.")
        return value


class RestaurantSummary(ORMModel):
    id: int
    name: str
    cuisine: str | None = None
    city: str | None = None
    image_url: str | None = None
    is_demo: bool


class RestaurantRead(ORMModel):
    id: int
    name: str
    description: str | None = None
    cuisine: str | None = None
    address: str | None = None
    city: str | None = None
    image_url: str | None = None
    is_demo: bool
    created_at: datetime


# ---------------------------------------------------------------------------
# 4. Ingredients and nutritional values
# ---------------------------------------------------------------------------


class IngredientCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str | None = None
    nutrition_basis: NutritionBasis = "g"
    calories: Decimal = Field(default=Decimal("0"), ge=0)
    protein: Decimal = Field(default=Decimal("0"), ge=0)
    fat: Decimal = Field(default=Decimal("0"), ge=0)
    carbohydrates: Decimal = Field(default=Decimal("0"), ge=0)
    fiber: Decimal | None = Field(default=None, ge=0)

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Ingredient name cannot be empty.")
        return value


class IngredientUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    nutrition_basis: NutritionBasis | None = None
    calories: Decimal | None = Field(default=None, ge=0)
    protein: Decimal | None = Field(default=None, ge=0)
    fat: Decimal | None = Field(default=None, ge=0)
    carbohydrates: Decimal | None = Field(default=None, ge=0)
    fiber: Decimal | None = Field(default=None, ge=0)

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("Ingredient name cannot be empty.")
        return value


class IngredientRead(ORMModel):
    id: int
    name: str
    description: str | None = None
    nutrition_basis: NutritionBasis
    calories: Decimal
    protein: Decimal
    fat: Decimal
    carbohydrates: Decimal
    fiber: Decimal | None = None
    created_at: datetime


# ---------------------------------------------------------------------------
# 5. Restaurant dishes and their ingredients
# ---------------------------------------------------------------------------


class DishIngredientCreate(BaseModel):
    ingredient_id: int = Field(gt=0)
    quantity: Decimal = Field(gt=0)
    unit: str = Field(min_length=1, max_length=20)
    is_estimated: bool = False
    notes: str | None = None


class DishIngredientRead(ORMModel):
    id: int
    dish_id: int
    ingredient_id: int
    quantity: Decimal
    unit: str
    is_estimated: bool
    notes: str | None = None
    ingredient: IngredientRead | None = None


class DishCreate(BaseModel):
    restaurant_id: int | None = Field(default=None, gt=0)
    name: str = Field(min_length=1, max_length=200)
    description: str | None = None
    category: str | None = Field(default=None, max_length=100)
    image_url: str | None = Field(default=None, max_length=1000)
    serving_size_g: Decimal | None = Field(default=None, gt=0)
    calories_per_serving: Decimal | None = Field(default=None, ge=0)
    protein_per_serving: Decimal | None = Field(default=None, ge=0)
    fat_per_serving: Decimal | None = Field(default=None, ge=0)
    carbs_per_serving: Decimal | None = Field(default=None, ge=0)
    ingredients: list[DishIngredientCreate] = Field(default_factory=list)

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Dish name cannot be empty.")
        return value


class DishUpdate(BaseModel):
    restaurant_id: int | None = Field(default=None, gt=0)
    name: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    category: str | None = Field(default=None, max_length=100)
    image_url: str | None = Field(default=None, max_length=1000)
    serving_size_g: Decimal | None = Field(default=None, gt=0)
    calories_per_serving: Decimal | None = Field(default=None, ge=0)
    protein_per_serving: Decimal | None = Field(default=None, ge=0)
    fat_per_serving: Decimal | None = Field(default=None, ge=0)
    carbs_per_serving: Decimal | None = Field(default=None, ge=0)
    ingredients: list[DishIngredientCreate] | None = None

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("Dish name cannot be empty.")
        return value


class DishSummary(ORMModel):
    id: int
    restaurant_id: int | None = None
    name: str
    category: str | None = None
    image_url: str | None = None
    serving_size_g: Decimal | None = None
    calories_per_serving: Decimal | None = None
    protein_per_serving: Decimal | None = None
    fat_per_serving: Decimal | None = None
    carbs_per_serving: Decimal | None = None


class DishRead(DishSummary):
    description: str | None = None
    created_at: datetime
    ingredients: list[DishIngredientRead] = Field(default_factory=list)


class RestaurantWithDishes(RestaurantRead):
    dishes: list[DishSummary] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# 6. Recipes and AI recipe generation
# ---------------------------------------------------------------------------


class RecipeIngredientCreate(BaseModel):
    ingredient_id: int | None = Field(default=None, gt=0)
    ingredient_name: str = Field(min_length=1, max_length=200)
    quantity: Decimal = Field(gt=0)
    unit: str = Field(min_length=1, max_length=20)
    position: int = Field(default=0, ge=0)
    notes: str | None = None

    @field_validator("ingredient_name")
    @classmethod
    def strip_ingredient_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Ingredient name cannot be empty.")
        return value


class RecipeIngredientRead(ORMModel):
    id: int
    recipe_id: int
    ingredient_id: int | None = None
    ingredient_name: str
    quantity: Decimal
    unit: str
    position: int
    notes: str | None = None
    ingredient: IngredientRead | None = None


class RecipeCreate(BaseModel):
    """Payload for saving a recipe; author_user_id comes from authentication."""

    source_dish_id: int | None = Field(default=None, gt=0)
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    servings: int = Field(default=1, ge=1, le=100)
    steps: list[str] = Field(
        default_factory=list,
        max_length=100,
        validation_alias=AliasChoices("steps", "instructions"),
        serialization_alias="instructions",
    )
    prep_time_minutes: int = Field(default=0, ge=0, le=1440)
    cook_time_minutes: int = Field(default=0, ge=0, le=1440)
    generated_by_ai: bool = False
    ingredients: list[RecipeIngredientCreate] = Field(default_factory=list)

    @field_validator("title")
    @classmethod
    def strip_title(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Recipe title cannot be empty.")
        return value

    @field_validator("steps")
    @classmethod
    def clean_steps(cls, value: list[str]) -> list[str]:
        cleaned = [step.strip() for step in value if step.strip()]
        return cleaned


class RecipeUpdate(BaseModel):
    source_dish_id: int | None = Field(default=None, gt=0)
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    servings: int | None = Field(default=None, ge=1, le=100)
    steps: list[str] | None = Field(
        default=None,
        max_length=100,
        validation_alias=AliasChoices("steps", "instructions"),
        serialization_alias="instructions",
    )
    prep_time_minutes: int | None = Field(default=None, ge=0, le=1440)
    cook_time_minutes: int | None = Field(default=None, ge=0, le=1440)
    ingredients: list[RecipeIngredientCreate] | None = None

    @field_validator("title")
    @classmethod
    def strip_title(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("Recipe title cannot be empty.")
        return value

    @field_validator("steps")
    @classmethod
    def clean_optional_steps(cls, value: list[str] | None) -> list[str] | None:
        if value is None:
            return None
        return [step.strip() for step in value if step.strip()]


class RecipeRead(ORMModel):
    id: int
    author_user_id: int | None = None
    source_dish_id: int | None = None
    title: str
    description: str | None = None
    servings: int
    steps: list[str] = Field(
        validation_alias=AliasChoices("steps", "instructions"),
        serialization_alias="instructions",
    )
    prep_time_minutes: int
    cook_time_minutes: int
    generated_by_ai: bool
    created_at: datetime
    updated_at: datetime
    ingredients: list[RecipeIngredientRead] = Field(default_factory=list)


class RecipeGenerationRequest(BaseModel):
    prompt: str = Field(min_length=3, max_length=4000)
    source_dish_id: int | None = Field(default=None, gt=0)
    servings: int = Field(default=2, ge=1, le=20)
    budget_level: BudgetLevel = "standard"
    max_prep_time_minutes: int | None = Field(default=None, ge=0, le=720)
    include_ingredients: list[str] = Field(default_factory=list, max_length=100)
    exclude_ingredients: list[str] = Field(default_factory=list, max_length=100)
    apply_dietary_preferences: bool = True
    language: Literal["en", "pl", "uk", "ru"] = "en"

    @field_validator("prompt")
    @classmethod
    def strip_prompt(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Prompt cannot be empty.")
        return value


class GeneratedRecipeIngredient(BaseModel):
    ingredient_id: int | None = Field(default=None, gt=0)
    ingredient_name: str = Field(min_length=1, max_length=200)
    quantity: Decimal = Field(gt=0)
    unit: str = Field(min_length=1, max_length=20)
    replacement_for: str | None = None
    substitution_reason: str | None = None
    notes: str | None = None


class RecipeGenerationResult(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    servings: int = Field(ge=1, le=100)
    steps: list[str] = Field(
        min_length=1,
        max_length=100,
        validation_alias=AliasChoices("steps", "instructions"),
        serialization_alias="instructions",
    )
    prep_time_minutes: int = Field(ge=0, le=1440)
    cook_time_minutes: int = Field(ge=0, le=1440)
    ingredients: list[GeneratedRecipeIngredient] = Field(min_length=1, max_length=100)
    nutrition_per_serving: NutritionValues | None = None
    generated_by_ai: bool = True


class IngredientSubstitutionRequest(BaseModel):
    ingredient_id: int | None = Field(default=None, gt=0)
    ingredient_name: str | None = Field(default=None, min_length=1, max_length=200)
    recipe_id: int | None = Field(default=None, gt=0)
    budget_level: BudgetLevel = "standard"
    exclude_ingredients: list[str] = Field(default_factory=list, max_length=100)

    @model_validator(mode="after")
    def require_ingredient(self) -> "IngredientSubstitutionRequest":
        if self.ingredient_id is None and not self.ingredient_name:
            raise ValueError("Provide ingredient_id or ingredient_name.")
        return self


class IngredientSubstitutionOption(BaseModel):
    ingredient_id: int | None = None
    ingredient_name: str
    reason: str
    nutrition_impact: str | None = None
    estimated_price_difference: Decimal | None = None
    currency: str = "PLN"


class IngredientSubstitutionResponse(BaseModel):
    original_ingredient_name: str
    options: list[IngredientSubstitutionOption]


# ---------------------------------------------------------------------------
# 7. Store chains and individual store locations
# ---------------------------------------------------------------------------


class StoreChainCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    slug: str = Field(min_length=1, max_length=120, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    website_url: str | None = Field(default=None, max_length=1000)
    logo_url: str | None = Field(default=None, max_length=1000)
    is_demo: bool = True

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Store-chain name cannot be empty.")
        return value

    @field_validator("slug")
    @classmethod
    def normalize_slug(cls, value: str) -> str:
        return value.strip().lower()


class StoreChainRead(ORMModel):
    id: int
    name: str
    slug: str
    website_url: str | None = None
    logo_url: str | None = None
    is_demo: bool
    created_at: datetime


class StoreCreate(BaseModel):
    store_chain_id: int | None = Field(default=None, gt=0)
    name: str = Field(min_length=1, max_length=200)
    address: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, max_length=100)
    website_url: str | None = Field(default=None, max_length=1000)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    is_demo: bool = True

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Store name cannot be empty.")
        return value

    @model_validator(mode="after")
    def coordinates_must_be_paired(self) -> "StoreCreate":
        if (self.latitude is None) != (self.longitude is None):
            raise ValueError("latitude and longitude must either both be provided or both be omitted.")
        return self


class StoreUpdate(BaseModel):
    store_chain_id: int | None = Field(default=None, gt=0)
    name: str | None = Field(default=None, min_length=1, max_length=200)
    address: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, max_length=100)
    website_url: str | None = Field(default=None, max_length=1000)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    is_demo: bool | None = None

    @model_validator(mode="after")
    def coordinates_must_be_paired(self) -> "StoreUpdate":
        fields = self.model_fields_set
        if ("latitude" in fields) != ("longitude" in fields):
            raise ValueError("Update latitude and longitude together.")
        return self


class StoreRead(ORMModel):
    id: int
    store_chain_id: int | None = None
    name: str
    address: str | None = None
    city: str | None = None
    website_url: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    is_demo: bool
    created_at: datetime
    chain: StoreChainRead | None = None


class StorePoint(BaseModel):
    """Map-ready store point. Coordinates are required for map results."""

    id: int
    store_chain_id: int | None = None
    chain_name: str
    name: str
    address: str | None = None
    city: str | None = None
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    is_demo: bool
    distance_meters: float = Field(ge=0)


class StoreSearchRequest(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    radius_meters: int = Field(default=500, ge=1, le=10000)


class StoreSearchResponse(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    radius_meters: int = Field(ge=1, le=10000)
    points: list[StorePoint]


# ---------------------------------------------------------------------------
# 8. Products, catalog items, and product price history
# ---------------------------------------------------------------------------


class ProductCreate(BaseModel):
    ingredient_id: int | None = Field(default=None, gt=0)
    name: str = Field(min_length=1, max_length=200)
    brand: str | None = Field(default=None, max_length=120)
    package_size: Decimal = Field(gt=0)
    package_unit: str = Field(min_length=1, max_length=20)
    barcode: str | None = Field(default=None, max_length=64)
    description: str | None = None
    image_url: str | None = Field(default=None, max_length=1000)
    is_demo: bool = True

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Product name cannot be empty.")
        return value


class ProductUpdate(BaseModel):
    ingredient_id: int | None = Field(default=None, gt=0)
    name: str | None = Field(default=None, min_length=1, max_length=200)
    brand: str | None = Field(default=None, max_length=120)
    package_size: Decimal | None = Field(default=None, gt=0)
    package_unit: str | None = Field(default=None, min_length=1, max_length=20)
    barcode: str | None = Field(default=None, max_length=64)
    description: str | None = None
    image_url: str | None = Field(default=None, max_length=1000)
    is_demo: bool | None = None


class ProductRead(ORMModel):
    id: int
    ingredient_id: int | None = None
    name: str
    brand: str | None = None
    package_size: Decimal
    package_unit: str
    barcode: str | None = None
    description: str | None = None
    image_url: str | None = None
    is_demo: bool
    created_at: datetime
    ingredient: IngredientRead | None = None


class StoreCatalogItemCreate(BaseModel):
    store_chain_id: int = Field(gt=0)
    product_id: int = Field(gt=0)
    demo_price: Decimal = Field(ge=0)
    currency: str = Field(default="PLN", min_length=3, max_length=3, pattern=r"^[A-Z]{3}$")
    availability_status: AvailabilityStatus = "unknown"
    is_demo: bool = True


class StoreCatalogItemUpdate(BaseModel):
    demo_price: Decimal | None = Field(default=None, ge=0)
    currency: str | None = Field(default=None, min_length=3, max_length=3, pattern=r"^[A-Z]{3}$")
    availability_status: AvailabilityStatus | None = None
    is_demo: bool | None = None


class StoreCatalogItemRead(ORMModel):
    id: int
    store_chain_id: int
    product_id: int
    demo_price: Decimal
    currency: str
    availability_status: AvailabilityStatus
    updated_at: datetime
    is_demo: bool
    created_at: datetime
    product: ProductRead | None = None


class CatalogProductRead(BaseModel):
    """Flattened API result combining Product and StoreCatalogItem."""

    product_id: int
    store_chain_id: int
    name: str
    ingredient_id: int | None = None
    ingredient_name: str | None = None
    brand: str | None = None
    package_size: Decimal = Field(gt=0)
    package_unit: str
    demo_price: Decimal = Field(ge=0)
    currency: str = "PLN"
    availability_status: AvailabilityStatus = "unknown"
    is_demo: bool
    image_url: str | None = None


class ProductPriceCreate(BaseModel):
    product_id: int = Field(gt=0)
    store_id: int = Field(gt=0)
    price: Decimal = Field(ge=0)
    currency: str = Field(default="PLN", min_length=3, max_length=3, pattern=r"^[A-Z]{3}$")
    is_demo: bool = True


class ProductPriceRead(ORMModel):
    id: int
    product_id: int
    store_id: int
    price: Decimal
    currency: str
    recorded_at: datetime
    is_demo: bool


class CatalogSearchResponse(BaseModel):
    store_chain_id: int
    store_chain_name: str
    items: list[CatalogProductRead]


# ---------------------------------------------------------------------------
# 9. Shopping lists and full-package basket calculations
# ---------------------------------------------------------------------------


class ShoppingListCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Shopping-list name cannot be empty.")
        return value


class ShoppingListUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("Shopping-list name cannot be empty.")
        return value


class ShoppingListItemCreate(BaseModel):
    product_id: int | None = Field(default=None, gt=0)
    ingredient_id: int | None = Field(default=None, gt=0)
    item_name: str = Field(min_length=1, max_length=200)
    quantity: Decimal = Field(default=Decimal("1"), gt=0)
    unit: str = Field(default="piece", min_length=1, max_length=20)
    notes: str | None = None

    @field_validator("item_name")
    @classmethod
    def strip_item_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Shopping-list item name cannot be empty.")
        return value

    @model_validator(mode="after")
    def only_one_reference(self) -> "ShoppingListItemCreate":
        if self.product_id is not None and self.ingredient_id is not None:
            raise ValueError("Select product_id or ingredient_id, not both.")
        return self


class ShoppingListItemUpdate(BaseModel):
    item_name: str | None = Field(default=None, min_length=1, max_length=200)
    quantity: Decimal | None = Field(default=None, gt=0)
    unit: str | None = Field(default=None, min_length=1, max_length=20)
    is_purchased: bool | None = None
    notes: str | None = None


class ShoppingListItemRead(ORMModel):
    id: int
    shopping_list_id: int
    product_id: int | None = None
    ingredient_id: int | None = None
    item_name: str
    quantity: Decimal
    unit: str
    is_purchased: bool
    purchased_at: datetime | None = None
    notes: str | None = None
    created_at: datetime
    product: ProductRead | None = None
    ingredient: IngredientRead | None = None


class ShoppingListRead(ORMModel):
    id: int
    user_id: int
    name: str
    created_at: datetime
    updated_at: datetime
    items: list[ShoppingListItemRead] = Field(default_factory=list)


class BasketCalculationItemRequest(BaseModel):
    product_id: int = Field(gt=0)
    needed_quantity: Decimal = Field(gt=0)
    needed_unit: str = Field(min_length=1, max_length=20)


class BasketLineCalculation(BaseModel):
    product_id: int
    product_name: str
    needed_quantity: Decimal = Field(gt=0)
    needed_unit: str
    package_size: Decimal = Field(gt=0)
    package_unit: str
    package_price: Decimal = Field(ge=0)
    currency: str = "PLN"
    packages_to_buy: int = Field(ge=0)
    purchased_quantity: Decimal = Field(ge=0)
    used_quantity_cost: Decimal = Field(ge=0)
    total_purchase_cost: Decimal = Field(ge=0)
    leftover_quantity: Decimal = Field(ge=0)
    leftover_cost: Decimal = Field(ge=0)


class BasketCalculationRequest(BaseModel):
    store_chain_id: int = Field(gt=0)
    items: list[BasketCalculationItemRequest] = Field(min_length=1, max_length=200)


class BasketCalculationResponse(BaseModel):
    store_chain_id: int
    currency: str = "PLN"
    items: list[BasketLineCalculation]
    total_used_quantity_cost: Decimal = Field(ge=0)
    total_purchase_cost: Decimal = Field(ge=0)
    total_leftover_cost: Decimal = Field(ge=0)


# ---------------------------------------------------------------------------
# 10. Food diary / meal tracker
# ---------------------------------------------------------------------------


class MealEntryCreate(BaseModel):
    eaten_at: datetime | None = None
    meal_type: MealType
    dish_id: int | None = Field(default=None, gt=0)
    recipe_id: int | None = Field(default=None, gt=0)
    custom_name: str | None = Field(default=None, max_length=200)
    servings: Decimal = Field(default=Decimal("1"), gt=0)
    calories: Decimal | None = Field(default=None, ge=0)
    protein: Decimal | None = Field(default=None, ge=0)
    fat: Decimal | None = Field(default=None, ge=0)
    carbohydrates: Decimal | None = Field(default=None, ge=0)
    notes: str | None = None

    @model_validator(mode="after")
    def validate_food_source(self) -> "MealEntryCreate":
        if self.dish_id is not None and self.recipe_id is not None:
            raise ValueError("A meal entry may reference a dish or a recipe, not both.")
        if self.dish_id is None and self.recipe_id is None and not (self.custom_name or "").strip():
            raise ValueError("Provide dish_id, recipe_id, or custom_name.")
        if self.custom_name is not None:
            self.custom_name = self.custom_name.strip() or None
        return self


class MealEntryUpdate(BaseModel):
    eaten_at: datetime | None = None
    meal_type: MealType | None = None
    dish_id: int | None = Field(default=None, gt=0)
    recipe_id: int | None = Field(default=None, gt=0)
    custom_name: str | None = Field(default=None, max_length=200)
    servings: Decimal | None = Field(default=None, gt=0)
    calories: Decimal | None = Field(default=None, ge=0)
    protein: Decimal | None = Field(default=None, ge=0)
    fat: Decimal | None = Field(default=None, ge=0)
    carbohydrates: Decimal | None = Field(default=None, ge=0)
    notes: str | None = None

    @model_validator(mode="after")
    def validate_catalog_sources(self) -> "MealEntryUpdate":
        if self.dish_id is not None and self.recipe_id is not None:
            raise ValueError("A meal entry may reference a dish or a recipe, not both.")
        return self


class MealEntryRead(ORMModel):
    id: int
    user_id: int
    eaten_at: datetime
    meal_type: MealType
    dish_id: int | None = None
    recipe_id: int | None = None
    custom_name: str | None = None
    servings: Decimal
    calories: Decimal | None = None
    protein: Decimal | None = None
    fat: Decimal | None = None
    carbohydrates: Decimal | None = None
    notes: str | None = None
    created_at: datetime
    dish: DishSummary | None = None
    recipe: RecipeRead | None = None


class DailyNutritionSummary(BaseModel):
    date: str
    calories: Decimal = Field(ge=0)
    protein: Decimal = Field(ge=0)
    fat: Decimal = Field(ge=0)
    carbohydrates: Decimal = Field(ge=0)
    entries_count: int = Field(ge=0)


# ---------------------------------------------------------------------------
# 11. Food photo analysis / AI scanning
# ---------------------------------------------------------------------------


class FoodScanIngredient(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    estimated_quantity: Decimal | None = Field(default=None, gt=0)
    unit: str | None = Field(default=None, max_length=20)


class FoodScanDetectedItem(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    estimated_quantity: Decimal | None = Field(default=None, gt=0)
    unit: str = Field(default="g", min_length=1, max_length=20)
    calories: Decimal | None = Field(default=None, ge=0)
    protein: Decimal | None = Field(default=None, ge=0)
    fat: Decimal | None = Field(default=None, ge=0)
    carbohydrates: Decimal | None = Field(default=None, ge=0)
    confidence: float | None = Field(default=None, ge=0, le=1)
    ingredients: list[FoodScanIngredient] = Field(default_factory=list)
    notes: str | None = None


class FoodScanAIResult(BaseModel):
    items: list[FoodScanDetectedItem] = Field(default_factory=list, max_length=100)
    total_calories: Decimal | None = Field(default=None, ge=0)
    total_protein: Decimal | None = Field(default=None, ge=0)
    total_fat: Decimal | None = Field(default=None, ge=0)
    total_carbohydrates: Decimal | None = Field(default=None, ge=0)
    confidence: float | None = Field(default=None, ge=0, le=1)
    summary: str | None = None


class FoodScanCorrectionRequest(BaseModel):
    """User-edited result to store instead of the original AI estimate."""

    corrected_result: FoodScanAIResult


class FoodScanConfirmRequest(BaseModel):
    """Optionally provide a corrected result when confirming a scan."""

    corrected_result: FoodScanAIResult | None = None
    meal_type: MealType = "other"
    eaten_at: datetime | None = None
    notes: str | None = None


class FoodScanSessionCreate(BaseModel):
    # Usually filled by the upload/storage service, not accepted as a local path.
    image_url: str | None = Field(default=None, max_length=1000)
    image_expires_at: datetime | None = None


class FoodScanSessionRead(ORMModel):
    id: int
    user_id: int
    status: FoodScanStatus
    result_ai: dict[str, Any] | None = None
    image_url: str | None = None
    image_expires_at: datetime | None = None
    error_message: str | None = None
    created_at: datetime
    completed_at: datetime | None = None
    confirmed_at: datetime | None = None


# ---------------------------------------------------------------------------
# Optional pagination schemas for list endpoints
# ---------------------------------------------------------------------------


class PaginationParams(BaseModel):
    limit: int = Field(default=20, ge=1, le=100)
    offset: int = Field(default=0, ge=0)


class PaginatedUsers(BaseModel):
    items: list[UserRead]
    total: int = Field(ge=0)
    limit: int = Field(ge=1, le=100)
    offset: int = Field(ge=0)


class PaginatedRestaurants(BaseModel):
    items: list[RestaurantRead]
    total: int = Field(ge=0)
    limit: int = Field(ge=1, le=100)
    offset: int = Field(ge=0)


class PaginatedRecipes(BaseModel):
    items: list[RecipeRead]
    total: int = Field(ge=0)
    limit: int = Field(ge=1, le=100)
    offset: int = Field(ge=0)
