from __future__ import annotations
from datetime import datetime
from decimal import Decimal
from typing import Any
from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Float,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB
from pgvector.sqlalchemy import Vector
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

# ============================================================
# 1. USERS
# ============================================================

class User(Base):
    """Пользователь приложения."""
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default=text("true"),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    dietary_preferences: Mapped[list[DietaryPreference]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    recipes: Mapped[list[Recipe]] = relationship(
        back_populates="author",
    )
    meal_entries: Mapped[list[MealEntry]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    shopping_lists: Mapped[list[ShoppingList]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    food_scan_sessions: Mapped[list[FoodScanSession]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )

# ============================================================
# 2. DIETARY PREFERENCES
# ============================================================

class DietaryPreference(Base):
    """Предпочтения, аллергии и ограничения пользователя."""
    __tablename__ = "dietary_preferences"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "preference_type",
            "preference",
            name="uq_dietary_preferences_user_type_preference",
        ),
        CheckConstraint(
            "preference_type IN ('diet', 'allergy', 'restriction')",
            name="ck_dietary_preferences_type",
        ),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # diet, allergy или restriction
    preference_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )
    # Например: vegetarian, peanuts, gluten_free
    preference: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    is_strict: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        server_default=text("false"),
        nullable=False,
    )
    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    user: Mapped[User] = relationship(
        back_populates="dietary_preferences",
    )

# ============================================================
# 3. RESTAURANTS
# ============================================================

class Restaurant(Base):
    """Демонстрационный ресторан."""
    __tablename__ = "restaurants"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        index=True,
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    cuisine: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        index=True,
    )
    address: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    city: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        index=True,
    )
    image_url: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )
    is_demo: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default=text("true"),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    dishes: Mapped[list[Dish]] = relationship(
        back_populates="restaurant",
        cascade="all, delete-orphan",
    )

# ============================================================
# 4. DISHES
# ============================================================

class Dish(Base):
    """Блюдо из каталога ресторана."""
    __tablename__ = "dishes"
    __table_args__ = (
        UniqueConstraint(
            "restaurant_id",
            "name",
            name="uq_dishes_restaurant_name",
        ),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    restaurant_id: Mapped[int | None] = mapped_column(
        ForeignKey("restaurants.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    category: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        index=True,
    )
    image_url: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )
    # Необязательно: масса известной порции в граммах.
    serving_size_g: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )
    # Известные нутриенты на одну порцию; None означает, что значение неизвестно.
    calories_per_serving: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    protein_per_serving: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    fat_per_serving: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    carbs_per_serving: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    restaurant: Mapped[Restaurant | None] = relationship(
        back_populates="dishes",
    )
    ingredients: Mapped[list[DishIngredient]] = relationship(
        back_populates="dish",
        cascade="all, delete-orphan",
    )
    recipes: Mapped[list[Recipe]] = relationship(
        back_populates="source_dish",
    )
    meal_entries: Mapped[list[MealEntry]] = relationship(
        back_populates="dish",
    )

# ============================================================
# 5. INGREDIENTS
# ============================================================

class Ingredient(Base):
    """Ингредиент и его пищевая ценность на 100 г или 100 мл."""
    __tablename__ = "ingredients"
    __table_args__ = (
        CheckConstraint(
            "nutrition_basis IN ('g', 'ml')",
            name="ck_ingredients_nutrition_basis",
        ),
        CheckConstraint(
            "calories >= 0 AND protein >= 0 "
            "AND fat >= 0 AND carbohydrates >= 0",
            name="ck_ingredients_nutrients_nonnegative",
        ),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(
        String(200),
        unique=True,
        index=True,
        nullable=False,
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    # nutrition_basis = g означает показатели на 100 г;
    # ml означает показатели на 100 мл.
    nutrition_basis: Mapped[str] = mapped_column(
        String(2),
        default="g",
        server_default=text("'g'"),
        nullable=False,
    )
    calories: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        default=0,
        server_default=text("0"),
        nullable=False,
    )
    protein: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        default=0,
        server_default=text("0"),
        nullable=False,
    )
    fat: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        default=0,
        server_default=text("0"),
        nullable=False,
    )
    carbohydrates: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        default=0,
        server_default=text("0"),
        nullable=False,
    )
    fiber: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    dish_links: Mapped[list[DishIngredient]] = relationship(
        back_populates="ingredient",
    )
    recipe_links: Mapped[list[RecipeIngredient]] = relationship(
        back_populates="ingredient",
    )
    products: Mapped[list[Product]] = relationship(
        back_populates="ingredient",
    )
    shopping_list_items: Mapped[list[ShoppingListItem]] = relationship(
        back_populates="ingredient",
    )

# ============================================================
# 6. DISH INGREDIENTS
# ============================================================

class DishIngredient(Base):
    """Связь блюда с известными ингредиентами и их количеством."""
    __tablename__ = "dish_ingredients"
    __table_args__ = (
        UniqueConstraint(
            "dish_id",
            "ingredient_id",
            name="uq_dish_ingredients_dish_ingredient",
        ),
        CheckConstraint(
            "quantity > 0",
            name="ck_dish_ingredients_quantity_positive",
        ),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    dish_id: Mapped[int] = mapped_column(
        ForeignKey("dishes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    ingredient_id: Mapped[int] = mapped_column(
        ForeignKey("ingredients.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    quantity: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )
    # g, ml, piece и т. д.
    unit: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )
    is_estimated: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        server_default=text("false"),
        nullable=False,
    )
    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    dish: Mapped[Dish] = relationship(
        back_populates="ingredients",
    )
    ingredient: Mapped[Ingredient] = relationship(
        back_populates="dish_links",
    )

# ============================================================
# 7. RECIPES
# ============================================================

class Recipe(Base):
    """Домашний рецепт, созданный пользователем или AI."""
    __tablename__ = "recipes"
    __table_args__ = (
        CheckConstraint(
            "servings > 0",
            name="ck_recipes_servings_positive",
        ),
        CheckConstraint(
            "prep_time_minutes >= 0 AND cook_time_minutes >= 0",
            name="ck_recipes_time_nonnegative",
        ),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    author_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    source_dish_id: Mapped[int | None] = mapped_column(
        ForeignKey("dishes.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        index=True,
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    servings: Mapped[int] = mapped_column(
        Integer,
        default=1,
        server_default=text("1"),
        nullable=False,
    )
    # Список шагов приготовления в формате JSON.
    steps: Mapped[list[str]] = mapped_column(
        JSONB,
        default=list,
        nullable=False,
    )
    prep_time_minutes: Mapped[int] = mapped_column(
        Integer,
        default=0,
        server_default=text("0"),
        nullable=False,
    )
    cook_time_minutes: Mapped[int] = mapped_column(
        Integer,
        default=0,
        server_default=text("0"),
        nullable=False,
    )
    generated_by_ai: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        server_default=text("false"),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    author: Mapped[User | None] = relationship(
        back_populates="recipes",
    )
    source_dish: Mapped[Dish | None] = relationship(
        back_populates="recipes",
    )
    ingredients: Mapped[list[RecipeIngredient]] = relationship(
        back_populates="recipe",
        cascade="all, delete-orphan",
        order_by="RecipeIngredient.position",
    )
    meal_entries: Mapped[list[MealEntry]] = relationship(
        back_populates="recipe",
    )

# ============================================================
# 8. RECIPE INGREDIENTS
# ============================================================

class RecipeIngredient(Base):
    """Ингредиент, количество и единица измерения в рецепте."""
    __tablename__ = "recipe_ingredients"
    __table_args__ = (
        UniqueConstraint(
            "recipe_id",
            "position",
            name="uq_recipe_ingredients_recipe_position",
        ),
        CheckConstraint(
            "quantity > 0",
            name="ck_recipe_ingredients_quantity_positive",
        ),
        CheckConstraint(
            "position >= 0",
            name="ck_recipe_ingredients_position_nonnegative",
        ),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    recipe_id: Mapped[int] = mapped_column(
        ForeignKey("recipes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # Может быть NULL, если ингредиента ещё нет в нашем каталоге.
    ingredient_id: Mapped[int | None] = mapped_column(
        ForeignKey("ingredients.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    # Сохраняем название даже при наличии ссылки на каталог.
    ingredient_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )
    quantity: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )
    unit: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )
    position: Mapped[int] = mapped_column(
        Integer,
        default=0,
        server_default=text("0"),
        nullable=False,
    )
    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    recipe: Mapped[Recipe] = relationship(
        back_populates="ingredients",
    )
    ingredient: Mapped[Ingredient | None] = relationship(
        back_populates="recipe_links",
    )

# ============================================================
# 9. STORE CHAINS
# ============================================================


class StoreChain(Base):
    """Сеть магазинов, например Lidl или Biedronka."""

    __tablename__ = "store_chains"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    website_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    is_demo: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default=text("true"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    stores: Mapped[list[Store]] = relationship(back_populates="chain")
    catalog_items: Mapped[list[StoreCatalogItem]] = relationship(
        back_populates="store_chain",
        cascade="all, delete-orphan",
    )



# ============================================================
# 10. STORES
# ============================================================

class Store(Base):
    """Конкретный филиал сети магазинов."""
    __tablename__ = "stores"
    __table_args__ = (
        CheckConstraint(
            "(latitude IS NULL AND longitude IS NULL) OR "
            "(latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)",
            name="ck_stores_valid_coordinates",
        ),
    )
    id: Mapped[int] = mapped_column(primary_key=True)

    store_chain_id: Mapped[int | None] = mapped_column(
        ForeignKey("store_chains.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        index=True,
    )
    address: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    city: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        index=True,
    )
    website_url: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )

    # Координаты филиала для поиска магазинов в заданном радиусе.
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    is_demo: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default=text("true"),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    chain: Mapped[StoreChain | None] = relationship(back_populates="stores")

    product_prices: Mapped[list[ProductPrice]] = relationship(
        back_populates="store",
        cascade="all, delete-orphan",
    )


# ============================================================
# 11. PRODUCTS
# ============================================================

class Product(Base):
    """Товар из демонстрационного каталога магазинов."""
    __tablename__ = "products"
    __table_args__ = (
        CheckConstraint(
            "package_size > 0",
            name="ck_products_package_size_positive",
        ),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    ingredient_id: Mapped[int | None] = mapped_column(
        ForeignKey("ingredients.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        index=True,
    )
    brand: Mapped[str | None] = mapped_column(
        String(120),
        nullable=True,
    )
    package_size: Mapped[Decimal] = mapped_column(
        Numeric(10, 3),
        nullable=False,
    )
    # Например: g, kg, ml, l, piece.
    package_unit: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )
    barcode: Mapped[str | None] = mapped_column(
        String(64),
        unique=True,
        nullable=True,
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    image_url: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )
    is_demo: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default=text("true"),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    ingredient: Mapped[Ingredient | None] = relationship(
        back_populates="products",
    )
    prices: Mapped[list[ProductPrice]] = relationship(
        back_populates="product",
        cascade="all, delete-orphan",
    )
    shopping_list_items: Mapped[list[ShoppingListItem]] = relationship(
        back_populates="product",
    )

    catalog_items: Mapped[list[StoreCatalogItem]] = relationship(
        back_populates="product",
        cascade="all, delete-orphan",
    )

# ============================================================
# 12. STORE CATALOG ITEMS
# ============================================================


class StoreCatalogItem(Base):
    """Демо-каталог товара для конкретной сети магазинов."""

    __tablename__ = "store_catalog_items"
    __table_args__ = (
        UniqueConstraint(
            "store_chain_id",
            "product_id",
            name="uq_store_catalog_items_chain_product",
        ),
        CheckConstraint(
            "demo_price >= 0",
            name="ck_store_catalog_items_demo_price_nonnegative",
        ),
        CheckConstraint(
            "availability_status IN ('available', 'unavailable', 'unknown')",
            name="ck_store_catalog_items_availability_status",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    store_chain_id: Mapped[int] = mapped_column(
        ForeignKey("store_chains.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    demo_price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )
    currency: Mapped[str] = mapped_column(
        String(3),
        default="PLN",
        server_default=text("'PLN'"),
        nullable=False,
    )
    availability_status: Mapped[str] = mapped_column(
        String(20),
        default="unknown",
        server_default=text("'unknown'"),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    is_demo: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default=text("true"),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    store_chain: Mapped[StoreChain] = relationship(back_populates="catalog_items")
    product: Mapped[Product] = relationship(back_populates="catalog_items")



# ============================================================
# 13. PRODUCT PRICES
# ============================================================

class ProductPrice(Base):
    """Цена товара в определённом магазине на конкретный момент."""
    __tablename__ = "product_prices"
    __table_args__ = (
        CheckConstraint(
            "price >= 0",
            name="ck_product_prices_price_nonnegative",
        ),
        Index(
            "ix_product_prices_product_store_recorded",
            "product_id",
            "store_id",
            "recorded_at",
        ),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    store_id: Mapped[int] = mapped_column(
        ForeignKey("stores.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )
    currency: Mapped[str] = mapped_column(
        String(3),
        default="PLN",
        server_default=text("'PLN'"),
        nullable=False,
    )
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    is_demo: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default=text("true"),
        nullable=False,
    )
    product: Mapped[Product] = relationship(
        back_populates="prices",
    )
    store: Mapped[Store] = relationship(
        back_populates="product_prices",
    )

# ============================================================
# 14. MEAL ENTRIES
# ============================================================

class MealEntry(Base):
    """Запись о съеденной пище в дневнике пользователя."""
    __tablename__ = "meal_entries"
    __table_args__ = (
        CheckConstraint(
            "meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'other')",
            name="ck_meal_entries_meal_type",
        ),
        CheckConstraint(
            "servings > 0",
            name="ck_meal_entries_servings_positive",
        ),
        CheckConstraint(
            "(dish_id IS NULL) OR (recipe_id IS NULL)",
            name="ck_meal_entries_one_catalog_source",
        ),
        CheckConstraint(
            "(calories IS NULL OR calories >= 0) "
            "AND (protein IS NULL OR protein >= 0) "
            "AND (fat IS NULL OR fat >= 0) "
            "AND (carbohydrates IS NULL OR carbohydrates >= 0)",
            name="ck_meal_entries_nutrients_nonnegative",
        ),
        Index(
            "ix_meal_entries_user_eaten_at",
            "user_id",
            "eaten_at",
        ),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    eaten_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    # breakfast, lunch, dinner, snack или other
    meal_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )
    dish_id: Mapped[int | None] = mapped_column(
        ForeignKey("dishes.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    recipe_id: Mapped[int | None] = mapped_column(
        ForeignKey("recipes.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    # Для еды, которая не связана с блюдом или рецептом каталога.
    custom_name: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )
    servings: Mapped[Decimal] = mapped_column(
        Numeric(8, 2),
        default=1,
        server_default=text("1"),
        nullable=False,
    )
    # Снимок нутриентов на момент записи.
    calories: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )
    protein: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )
    fat: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )
    carbohydrates: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )
    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    user: Mapped[User] = relationship(
        back_populates="meal_entries",
    )
    dish: Mapped[Dish | None] = relationship(
        back_populates="meal_entries",
    )
    recipe: Mapped[Recipe | None] = relationship(
        back_populates="meal_entries",
    )

# ============================================================
# 15. SHOPPING LISTS
# ============================================================

class ShoppingList(Base):
    """Список покупок пользователя."""
    __tablename__ = "shopping_lists"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    user: Mapped[User] = relationship(
        back_populates="shopping_lists",
    )
    items: Mapped[list[ShoppingListItem]] = relationship(
        back_populates="shopping_list",
        cascade="all, delete-orphan",
    )

# ============================================================
# 16. SHOPPING LIST ITEMS
# ============================================================

class ShoppingListItem(Base):
    """Товар или ингредиент внутри списка покупок."""
    __tablename__ = "shopping_list_items"
    __table_args__ = (
        CheckConstraint(
            "quantity > 0",
            name="ck_shopping_list_items_quantity_positive",
        ),
        CheckConstraint(
            "NOT (product_id IS NOT NULL AND ingredient_id IS NOT NULL)",
            name="ck_shopping_list_items_single_reference",
        ),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    shopping_list_id: Mapped[int] = mapped_column(
        ForeignKey("shopping_lists.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    product_id: Mapped[int | None] = mapped_column(
        ForeignKey("products.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    ingredient_id: Mapped[int | None] = mapped_column(
        ForeignKey("ingredients.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    # Название сохраняется даже при удалении товара из каталога.
    item_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )
    quantity: Mapped[Decimal] = mapped_column(
        Numeric(10, 3),
        default=1,
        server_default=text("1"),
        nullable=False,
    )
    unit: Mapped[str] = mapped_column(
        String(20),
        default="piece",
        server_default=text("'piece'"),
        nullable=False,
    )
    is_purchased: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        server_default=text("false"),
        nullable=False,
    )
    purchased_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    shopping_list: Mapped[ShoppingList] = relationship(
        back_populates="items",
    )
    product: Mapped[Product | None] = relationship(
        back_populates="shopping_list_items",
    )
    ingredient: Mapped[Ingredient | None] = relationship(
        back_populates="shopping_list_items",
    )

# ============================================================
# 17. FOOD SCAN SESSIONS
# ============================================================

class FoodScanSession(Base):
    """Сессия анализа фотографии еды с помощью AI."""
    __tablename__ = "food_scan_sessions"
    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'processing', 'completed', 'failed', 'confirmed')",
            name="ck_food_scan_sessions_status",
        ),
        Index(
            "ix_food_scan_sessions_user_created",
            "user_id",
            "created_at",
        ),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # pending, processing, completed, failed или confirmed
    status: Mapped[str] = mapped_column(
        String(20),
        default="pending",
        server_default=text("'pending'"),
        nullable=False,
    )
    # Структурированный результат анализа AI.
    result_ai: Mapped[dict[str, Any] | None] = mapped_column(
        JSONB,
        nullable=True,
    )
    image_url: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )
    image_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    error_message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    confirmed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    user: Mapped[User] = relationship(
        back_populates="food_scan_sessions",
    )



# RecipeEmbedding / pgvector is postponed until the PostgreSQL image
# has the pgvector extension installed. See the setup note in README.


# ============================================================



class RecipeEmbedding(Base):

    """Векторные представления каталога для поиска и RAG."""



    __tablename__ = "recipe_embeddings"



    __table_args__ = (

        CheckConstraint(

            "entity_type IN ('recipe', 'dish', 'ingredient', 'product', 'restaurant')",

            name="ck_recipe_embeddings_entity_type",

        ),

        CheckConstraint(

            "entity_id > 0 AND chunk_index >= 0",

            name="ck_recipe_embeddings_ids_positive",

        ),

        UniqueConstraint(

            "entity_type",

            "entity_id",

            "chunk_index",

            name="uq_recipe_embeddings_entity_chunk",

        ),

        Index(

            "ix_recipe_embeddings_embedding_hnsw",

            "embedding",

            postgresql_using="hnsw",

            postgresql_ops={"embedding": "vector_cosine_ops"},

        ),

    )



    id: Mapped[int] = mapped_column(primary_key=True)



    # Полиморфная ссылка на один из типов объектов каталога.

    # entity_id ссылается на ID объекта соответствующего типа.

    entity_type: Mapped[str] = mapped_column(

        String(30),

        nullable=False,

    )



    entity_id: Mapped[int] = mapped_column(

        Integer,

        nullable=False,

    )



    # Номер части текста, если один объект разбит на chunks.

    chunk_index: Mapped[int] = mapped_column(

        Integer,

        default=0,

        server_default=text("0"),

        nullable=False,

    )



    # Текст, по которому построен embedding.

    content: Mapped[str] = mapped_column(

        Text,

        nullable=False,

    )



    # Размерность 1536 соответствует стандартной размерности

    # embeddings модели OpenAI text-embedding-3-small.

    embedding: Mapped[list[float]] = mapped_column(

        Vector(1536),

        nullable=False,

    )



    embedding_model: Mapped[str] = mapped_column(

        String(100),

        default="text-embedding-3-small",

        server_default=text("'text-embedding-3-small'"),

        nullable=False,

    )



    created_at: Mapped[datetime] = mapped_column(

        DateTime(timezone=True),

        server_default=func.now(),

        nullable=False,

    )
