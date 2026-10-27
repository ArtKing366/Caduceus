"""Idempotent demo-data seed for Caduceus.

Run from the repository root:
    py -m scripts.seed_data

The listed Łódź store addresses/coordinates are based on public store listings.
Catalog prices/availability, demo restaurants, recipes and nutrition numbers are
sample data only, not live store information. All changes use one transaction.
"""
from __future__ import annotations

from decimal import Decimal
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import (
    Dish, DishIngredient, Ingredient, Product, Recipe, RecipeIngredient,
    Restaurant, Store, StoreCatalogItem, StoreChain,
)


def D(value: Any) -> Decimal:
    """Create Decimal from a string/number without binary-float money errors."""
    return Decimal(str(value))


# Real publicly listed addresses; coordinates are approximate map coordinates.
# is_demo=True labels the rows as seeded application data, not live integrations.
STORES = [
    ("lidl", "Lidl — Zgierska 211 (seeded)", "ul. Zgierska 211, 91-497 Łódź", 51.8173, 19.43391),
    ("lidl", "Lidl — Karolewska 53 (seeded)", "ul. Karolewska 53, 90-560 Łódź", 51.758327, 19.4319245),
    ("biedronka", "Biedronka — Ogrodowa 18 (seeded)", "ul. Ogrodowa 18, 91-065 Łódź", 51.778293, 19.449906),
    ("biedronka", "Biedronka — Żeromskiego 32 (seeded)", "ul. Stefana Żeromskiego 32, 90-737 Łódź", 51.7703239, 19.446517),
]

# name, nutrition_basis, kcal, protein, fat, carbs, fiber; per 100 g or 100 ml.
# Values are common approximate demo values; replace with verified labels later.
INGREDIENTS = [
    ("Mleko 2%", "ml", "50", "3.4", "2.0", "4.8", "0"),
    ("Jajko", "g", "143", "12.6", "9.5", "0.7", None),
    ("Płatki owsiane", "g", "370", "13.5", "7.0", "58.7", "10.0"),
    ("Ryż biały, suchy", "g", "360", "7.0", "0.7", "79.0", "1.3"),
    ("Pierś z kurczaka", "g", "120", "22.5", "2.6", "0", None),
    ("Pomidor", "g", "18", "0.9", "0.2", "3.9", "1.2"),
    ("Banan", "g", "89", "1.1", "0.3", "22.8", "2.6"),
    ("Makaron pszenny, suchy", "g", "371", "13.0", "1.5", "74.0", "3.2"),
    ("Jogurt naturalny", "g", "61", "3.5", "3.3", "4.7", None),
    ("Oliwa z oliwek", "ml", "884", "0", "100", "0", None),
    ("Chleb pszenny", "g", "265", "8.9", "3.2", "49.0", "2.7"),
    ("Ziemniak", "g", "77", "2.0", "0.1", "17.5", "2.2"),
]

# key, product name, linked ingredient, package size, package unit
PRODUCTS = [
    ("milk", "Mleko 2% 1 l", "Mleko 2%", "1", "l"),
    ("eggs", "Jajka 10 szt.", "Jajko", "10", "piece"),
    ("oats", "Płatki owsiane 500 g", "Płatki owsiane", "500", "g"),
    ("rice", "Ryż biały 1 kg", "Ryż biały, suchy", "1000", "g"),
    ("chicken", "Pierś z kurczaka 500 g", "Pierś z kurczaka", "500", "g"),
    ("tomatoes", "Pomidory 500 g", "Pomidor", "500", "g"),
    ("bananas", "Banany 1 kg", "Banan", "1000", "g"),
    ("pasta", "Makaron pszenny 500 g", "Makaron pszenny, suchy", "500", "g"),
    ("yogurt", "Jogurt naturalny 400 g", "Jogurt naturalny", "400", "g"),
    ("olive_oil", "Oliwa z oliwek 500 ml", "Oliwa z oliwek", "500", "ml"),
    ("bread", "Chleb pszenny 500 g", "Chleb pszenny", "500", "g"),
    ("potatoes", "Ziemniaki 1 kg", "Ziemniak", "1000", "g"),
]

# Synthetic prices in PLN. Olive oil is intentionally missing from Biedronka's
# demo catalog so a later cart-comparison endpoint can test unavailable items.
PRICES = {
    "lidl": {
        "milk": "3.49", "eggs": "8.99", "oats": "3.79", "rice": "5.49",
        "chicken": "9.99", "tomatoes": "4.49", "bananas": "6.49", "pasta": "3.29",
        "yogurt": "2.79", "olive_oil": "19.99", "bread": "4.29", "potatoes": "4.99",
    },
    "biedronka": {
        "milk": "3.69", "eggs": "8.49", "oats": "3.99", "rice": "5.29",
        "chicken": "10.49", "tomatoes": "4.19", "bananas": "6.99", "pasta": "2.99",
        "yogurt": "2.69", "bread": "3.99", "potatoes": "5.49",
    },
}

# Two demo restaurant catalogs; these are not real restaurants or real menus.
RESTAURANTS = [
    ("bistro", "Caduceus Demo Bistro", "Demonstracyjny katalog dań, nie prawdziwa restauracja.", "mixed"),
    ("kitchen", "Caduceus Demo Kitchen", "Drugi demonstracyjny katalog dań; wszystkie pozycje są przykładowe.", "home cooking"),
]

# key, restaurant key, name, description, category, serving grams, kcal/protein/fat/carbs,
# ingredient links: (ingredient name, quantity, unit)
DISHES = [
    ("chicken_rice", "bistro", "Kurczak z ryżem i pomidorami (DEMO)",
     "Przykładowe danie; skład i wartości odżywcze są orientacyjne.", "lunch", "380",
     "570", "43", "10", "76",
     [("Pierś z kurczaka", "150", "g"), ("Ryż biały, suchy", "80", "g"),
      ("Pomidor", "100", "g"), ("Oliwa z oliwek", "5", "ml")]),
    ("oatmeal", "kitchen", "Owsianka z bananem (DEMO)",
     "Przykładowe śniadanie; wartości odżywcze są orientacyjne.", "breakfast", "360",
     "390", "15", "10", "61",
     [("Płatki owsiane", "60", "g"), ("Mleko 2%", "200", "ml"), ("Banan", "100", "g")]),
    ("toast", "bistro", "Tost z jajkiem i pomidorem (DEMO)",
     "Przykładowe śniadanie do testowania katalogu dań.", "breakfast", "250",
     "330", "16", "12", "38",
     [("Chleb pszenny", "80", "g"), ("Jajko", "50", "g"), ("Pomidor", "100", "g")]),
]

# key, title, description, source dish key or None, servings, prep min, cook min,
# steps, ingredient rows: (ingredient name, quantity, unit, notes or None)
RECIPES = [
    ("chicken_rice", "Kurczak z ryżem i pomidorami — przepis demo",
     "Prosty przykładowy przepis na dwie porcje.", "chicken_rice", 2, 10, 25,
     ["Opłucz ryż i ugotuj zgodnie z instrukcją na opakowaniu.",
      "Pokrój kurczaka i pomidora.",
      "Usmaż kurczaka na odmierzonej ilości oliwy i doprowadź do pełnego ugotowania.",
      "Podawaj kurczaka z ryżem i pomidorem."],
     [("Pierś z kurczaka", "300", "g", "Główne źródło białka."),
      ("Ryż biały, suchy", "160", "g", None), ("Pomidor", "200", "g", None),
      ("Oliwa z oliwek", "10", "ml", "Ilość orientacyjna.")]),
    ("oatmeal", "Owsianka bananowa — przepis demo", "Przykładowe śniadanie na jedną porcję.",
     "oatmeal", 1, 3, 7,
     ["Wsyp płatki do rondelka.", "Dodaj mleko i podgrzewaj, mieszając, aż płatki zmiękną.",
      "Pokrój banana i dodaj na wierzch."],
     [("Płatki owsiane", "60", "g", None), ("Mleko 2%", "250", "ml", None),
      ("Banan", "120", "g", None)]),
    ("tomato_pasta", "Makaron z pomidorem i jogurtem — przepis demo",
     "Przykładowy niedrogi przepis na dwie porcje.", None, 2, 5, 15,
     ["Ugotuj makaron i zachowaj niewielką ilość wody z gotowania.",
      "Pokrój pomidory i krótko je podgrzej.",
      "Zdejmij patelnię z ognia, wmieszaj jogurt i połącz z makaronem."],
     [("Makaron pszenny, suchy", "160", "g", None), ("Pomidor", "250", "g", None),
      ("Jogurt naturalny", "100", "g", "Dodaj po zdjęciu patelni z ognia.")]),
]


def upsert(session: Session, model: Any, key: dict[str, Any], values: dict[str, Any]) -> Any:
    """Find a seed record by a stable natural key; update it or create it."""
    obj = session.scalars(select(model).filter_by(**key)).first()
    if obj is None:
        obj = model(**key, **{k: v for k, v in values.items() if k not in key})
        session.add(obj)
    for field, value in values.items():
        setattr(obj, field, value)
    session.flush()
    return obj


def seed(session: Session) -> None:
    chains = {}
    for slug, name, website in (
        ("lidl", "Lidl", "https://www.lidl.pl/"),
        ("biedronka", "Biedronka", "https://www.biedronka.pl/"),
    ):
        chains[slug] = upsert(
            session, StoreChain, {"slug": slug},
            {"name": name, "website_url": website, "is_demo": True},
        )

    ingredients = {}
    for name, basis, kcal, protein, fat, carbs, fiber in INGREDIENTS:
        ingredients[name] = upsert(
            session, Ingredient, {"name": name},
            {"description": "Wartości odżywcze orientacyjne na 100 g/ml; dane seed demo.",
             "nutrition_basis": basis, "calories": D(kcal), "protein": D(protein),
             "fat": D(fat), "carbohydrates": D(carbs),
             "fiber": D(fiber) if fiber is not None else None},
        )

    for slug, name, address, latitude, longitude in STORES:
        upsert(
            session, Store,
            {"store_chain_id": chains[slug].id, "address": address, "city": "Łódź"},
            {"name": name, "latitude": latitude, "longitude": longitude, "is_demo": True},
        )

    products = {}
    for key, name, ingredient_name, size, unit in PRODUCTS:
        products[key] = upsert(
            session, Product,
            {"name": name, "package_size": D(size), "package_unit": unit, "brand": None},
            {"ingredient_id": ingredients[ingredient_name].id,
             "description": "Produkt katalogowy demonstracyjny; cena nie jest ceną live.",
             "is_demo": True},
        )

    for slug, catalog in PRICES.items():
        for product_key, price in catalog.items():
            status = "available"
            if (slug, product_key) == ("lidl", "potatoes"):
                status = "unknown"
            elif (slug, product_key) == ("biedronka", "chicken"):
                status = "unavailable"
            upsert(
                session, StoreCatalogItem,
                {"store_chain_id": chains[slug].id, "product_id": products[product_key].id},
                {"demo_price": D(price), "currency": "PLN",
                 "availability_status": status, "is_demo": True},
            )

    restaurants = {}
    for key, name, description, cuisine in RESTAURANTS:
        restaurants[key] = upsert(
            session, Restaurant,
            {"name": name, "city": "Łódź", "address": None},
            {"description": description, "cuisine": cuisine, "is_demo": True},
        )

    dishes = {}
    for row in DISHES:
        (key, restaurant_key, name, description, category, serving_size,
         calories, protein, fat, carbs, dish_ingredients) = row
        dish = upsert(
            session, Dish,
            {"restaurant_id": restaurants[restaurant_key].id, "name": name},
            {"description": description, "category": category,
             "serving_size_g": D(serving_size), "calories_per_serving": D(calories),
             "protein_per_serving": D(protein), "fat_per_serving": D(fat),
             "carbs_per_serving": D(carbs)},
        )
        dishes[key] = dish
        for ingredient_name, quantity, unit in dish_ingredients:
            upsert(
                session, DishIngredient,
                {"dish_id": dish.id, "ingredient_id": ingredients[ingredient_name].id},
                {"quantity": D(quantity), "unit": unit, "is_estimated": True,
                 "notes": "Ilość demonstracyjna; wartości nie pochodzą z prawdziwego menu."},
            )

    for (key, title, description, source_dish_key, servings, prep_min, cook_min,
         steps, recipe_ingredients) in RECIPES:
        source_dish_id = dishes[source_dish_key].id if source_dish_key else None
        recipe = upsert(
            session, Recipe,
            {"title": title, "source_dish_id": source_dish_id, "author_user_id": None},
            {"description": description, "servings": servings, "steps": steps,
             "prep_time_minutes": prep_min, "cook_time_minutes": cook_min,
             "generated_by_ai": False},
        )
        for position, (ingredient_name, quantity, unit, notes) in enumerate(recipe_ingredients):
            upsert(
                session, RecipeIngredient,
                {"recipe_id": recipe.id, "position": position},
                {"ingredient_id": ingredients[ingredient_name].id,
                 "ingredient_name": ingredient_name, "quantity": D(quantity),
                 "unit": unit, "notes": notes},
            )
        # Remove outdated trailing positions if this seeded recipe is later edited.
        valid_positions = set(range(len(recipe_ingredients)))
        for link in session.scalars(
            select(RecipeIngredient).where(RecipeIngredient.recipe_id == recipe.id)
        ).all():
            if link.position not in valid_positions:
                session.delete(link)
        session.flush()


def count_rows(session: Session, model: Any) -> int:
    return int(session.scalar(select(func.count()).select_from(model)) or 0)


def main() -> None:
    # Success commits the entire seed; any exception rolls back every seed write.
    with SessionLocal() as session:
        with session.begin():
            seed(session)

        print("\nCaduceus demo seed completed.")
        print("NOTE: catalog prices/availability, restaurant menus and nutrition figures are DEMO values.\n")
        for label, model in (
            ("Store chains", StoreChain), ("Store locations", Store),
            ("Ingredients", Ingredient), ("Products", Product),
            ("Store catalog entries", StoreCatalogItem), ("Restaurants", Restaurant),
            ("Dishes", Dish), ("Dish ingredient links", DishIngredient),
            ("Recipes", Recipe), ("Recipe ingredient links", RecipeIngredient),
        ):
            print(f"{label}: {count_rows(session, model)} total row(s)")
        for slug in ("lidl", "biedronka"):
            chain = session.scalars(select(StoreChain).where(StoreChain.slug == slug)).first()
            if chain:
                count = session.scalar(select(func.count()).select_from(StoreCatalogItem)
                                       .where(StoreCatalogItem.store_chain_id == chain.id)) or 0
                print(f"  {chain.name} catalog items: {count}")


if __name__ == "__main__":
    main()
