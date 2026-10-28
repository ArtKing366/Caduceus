from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table("users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(320), nullable=False, unique=True, index=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(120), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.create_table("dietary_preferences",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("preference", sa.String(80), nullable=False),
        sa.Column("strict", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.UniqueConstraint("user_id", "preference", name="uq_dietary_preference_user_preference"))
    op.create_table("restaurants",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("code", sa.String(80), nullable=False, unique=True),
        sa.Column("name", sa.String(160), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("category", sa.String(80), nullable=True),
        sa.Column("address", sa.String(255), nullable=True),
        sa.Column("city", sa.String(100), nullable=False, server_default="Łódź"),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()))
    op.create_index("ix_restaurants_name", "restaurants", ["name"])
    op.create_table("ingredients",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("code", sa.String(80), nullable=False, unique=True),
        sa.Column("name", sa.String(160), nullable=False),
        sa.Column("unit", sa.String(20), nullable=False, server_default="g"),
        sa.Column("calories_per_100", sa.Float(), nullable=False, server_default="0"),
        sa.Column("protein_per_100", sa.Float(), nullable=False, server_default="0"),
        sa.Column("fat_per_100", sa.Float(), nullable=False, server_default="0"),
        sa.Column("carbs_per_100", sa.Float(), nullable=False, server_default="0"),
        sa.Column("allergens", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default="[]"))
    op.create_table("dishes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("code", sa.String(80), nullable=False, unique=True),
        sa.Column("restaurant_id", sa.Integer(), sa.ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(160), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("category", sa.String(80), nullable=True),
        sa.Column("price_pln", sa.Float(), nullable=False, server_default="0"),
        sa.Column("serving_grams", sa.Float(), nullable=False, server_default="0"),
        sa.Column("calories", sa.Float(), nullable=False, server_default="0"),
        sa.Column("protein", sa.Float(), nullable=False, server_default="0"),
        sa.Column("fat", sa.Float(), nullable=False, server_default="0"),
        sa.Column("carbs", sa.Float(), nullable=False, server_default="0"),
        sa.Column("dietary_tags", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default="[]"),
        sa.Column("allergens", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default="[]"))
    op.create_table("dish_ingredients",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("dish_id", sa.Integer(), sa.ForeignKey("dishes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("ingredient_id", sa.Integer(), sa.ForeignKey("ingredients.id"), nullable=False),
        sa.Column("amount_grams", sa.Float(), nullable=False))
    op.create_table("recipes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("code", sa.String(80), nullable=False, unique=True),
        sa.Column("name", sa.String(160), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("instructions", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default="[]"),
        sa.Column("servings", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("prep_minutes", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("dietary_tags", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default="[]"))
    op.create_table("recipe_ingredients",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("recipe_id", sa.Integer(), sa.ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("ingredient_id", sa.Integer(), sa.ForeignKey("ingredients.id"), nullable=False),
        sa.Column("amount_grams", sa.Float(), nullable=False))
    op.create_table("stores",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("code", sa.String(80), nullable=False, unique=True),
        sa.Column("name", sa.String(160), nullable=False),
        sa.Column("address", sa.String(255), nullable=True),
        sa.Column("city", sa.String(100), nullable=False, server_default="Łódź"),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True))
    op.create_table("products",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("code", sa.String(80), nullable=False, unique=True),
        sa.Column("name", sa.String(160), nullable=False),
        sa.Column("category", sa.String(80), nullable=True),
        sa.Column("unit", sa.String(20), nullable=False, server_default="g"),
        sa.Column("pack_quantity", sa.Float(), nullable=False, server_default="1"),
        sa.Column("pack_unit", sa.String(20), nullable=False, server_default="pcs"),
        sa.Column("calories_per_100", sa.Float(), nullable=False, server_default="0"),
        sa.Column("protein_per_100", sa.Float(), nullable=False, server_default="0"),
        sa.Column("fat_per_100", sa.Float(), nullable=False, server_default="0"),
        sa.Column("carbs_per_100", sa.Float(), nullable=False, server_default="0"))
    op.create_table("store_catalog_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("store_id", sa.Integer(), sa.ForeignKey("stores.id", ondelete="CASCADE"), nullable=False),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id", ondelete="CASCADE"), nullable=False),
        sa.Column("price_pln", sa.Float(), nullable=False),
        sa.Column("available", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.UniqueConstraint("store_id", "product_id", name="uq_store_catalog_product"))
    op.create_table("meal_entries",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(160), nullable=False),
        sa.Column("meal_type", sa.String(40), nullable=False, server_default="other"),
        sa.Column("eaten_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("serving_grams", sa.Float(), nullable=False, server_default="0"),
        sa.Column("calories", sa.Float(), nullable=False, server_default="0"),
        sa.Column("protein", sa.Float(), nullable=False, server_default="0"),
        sa.Column("fat", sa.Float(), nullable=False, server_default="0"),
        sa.Column("carbs", sa.Float(), nullable=False, server_default="0"),
        sa.Column("notes", sa.Text(), nullable=True))
    op.create_table("shopping_lists",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(160), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.create_table("shopping_list_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("shopping_list_id", sa.Integer(), sa.ForeignKey("shopping_lists.id", ondelete="CASCADE"), nullable=False),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id", ondelete="SET NULL"), nullable=True),
        sa.Column("name", sa.String(160), nullable=False),
        sa.Column("quantity", sa.Float(), nullable=False, server_default="1"),
        sa.Column("unit", sa.String(20), nullable=False, server_default="pcs"),
        sa.Column("estimated_price_pln", sa.Float(), nullable=False, server_default="0"),
        sa.Column("is_checked", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.create_table("food_scan_sessions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("image_reference", sa.String(500), nullable=True),
        sa.Column("status", sa.String(30), nullable=False, server_default="pending"),
        sa.Column("result_json", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))

def downgrade():
    for table in ["food_scan_sessions","shopping_list_items","shopping_lists","meal_entries","store_catalog_items","products","stores","recipe_ingredients","recipes","dish_ingredients","dishes","ingredients","restaurants","dietary_preferences","users"]:
        op.drop_table(table)
