"""Integration-test fixtures. Use a dedicated empty PostgreSQL test database."""

from __future__ import annotations

import os

# Ensure auth utilities can be imported in test runs even when the developer's
# local .env does not yet define a test secret. A real app uses its .env secret.
os.environ.setdefault("SECRET_KEY", "caduceus-test-secret-key-not-for-production-48")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from app.database import Base, get_db
from app.main import app
from app.models import (  # noqa: F401 - register every model with Base.metadata
    DietaryPreference,
    Dish,
    DishIngredient,
    FoodScanSession,
    Ingredient,
    MealEntry,
    Product,
    ProductPrice,
    Recipe,
    RecipeEmbedding,
    RecipeIngredient,
    Restaurant,
    ShoppingList,
    ShoppingListItem,
    Store,
    StoreCatalogItem,
    StoreChain,
    User,
)


@pytest.fixture(scope="session")
def test_engine():
    test_database_url = os.getenv("TEST_DATABASE_URL", "").strip()
    if not test_database_url:
        pytest.skip(
            "Set TEST_DATABASE_URL to a separate, disposable PostgreSQL database "
            "before running integration tests."
        )

    from app.core.config import settings

    if test_database_url == settings.database_url:
        raise RuntimeError(
            "TEST_DATABASE_URL must not point to the normal development database. "
            "Tests drop/recreate tables in the dedicated test database."
        )

    engine = create_engine(test_database_url, pool_pre_ping=True)
    with engine.begin() as connection:
        # Needed because the project's schema contains a pgvector column/index.
        connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        Base.metadata.drop_all(bind=connection)
        Base.metadata.create_all(bind=connection)

    yield engine

    with engine.begin() as connection:
        Base.metadata.drop_all(bind=connection)
    engine.dispose()


@pytest.fixture
def db_session(test_engine):
    connection = test_engine.connect()
    outer_transaction = connection.begin()
    test_session_factory = sessionmaker(
        bind=connection,
        autoflush=False,
        expire_on_commit=False,
        join_transaction_mode="create_savepoint",
    )
    session: Session = test_session_factory()
    try:
        yield session
    finally:
        session.close()
        outer_transaction.rollback()
        connection.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()
