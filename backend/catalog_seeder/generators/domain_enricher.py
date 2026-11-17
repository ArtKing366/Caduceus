import random
from typing import Dict, List, Tuple

from ..config import SeederConfig
from ..schemas import (
    DishIn,
    IngredientIn,
    ProductIn,
    RecipeIn,
    RestaurantIn,
    StoreCatalogItemIn,
    StoreIn,
)
from ..utils import CodeRegistry

# Curated core ingredients with accurate nutrition per 100g/ml & EU allergen tags
CURATED_INGREDIENTS: List[dict] = [
    {"code": "chicken-breast", "name": "Chicken breast", "unit": "g", "calories_per_100": 120, "protein_per_100": 22.5, "fat_per_100": 2.6, "carbs_per_100": 0.0, "allergens": []},
    {"code": "turkey-fillet", "name": "Turkey breast fillet", "unit": "g", "calories_per_100": 111, "protein_per_100": 24.0, "fat_per_100": 1.2, "carbs_per_100": 0.0, "allergens": []},
    {"code": "beef-entrecote", "name": "Beef entrecote (ribeye)", "unit": "g", "calories_per_100": 250, "protein_per_100": 21.0, "fat_per_100": 18.5, "carbs_per_100": 0.0, "allergens": []},
    {"code": "atlantic-salmon", "name": "Atlantic salmon fillet", "unit": "g", "calories_per_100": 208, "protein_per_100": 20.4, "fat_per_100": 13.4, "carbs_per_100": 0.0, "allergens": ["fish"]},
    {"code": "chicken-egg", "name": "Chicken egg (whole)", "unit": "g", "calories_per_100": 143, "protein_per_100": 12.6, "fat_per_100": 9.5, "carbs_per_100": 0.7, "allergens": ["eggs"]},
    {"code": "twarog-poltlusty", "name": "Polish semi-skimmed quark (Twaróg półtłusty)", "unit": "g", "calories_per_100": 133, "protein_per_100": 18.7, "fat_per_100": 4.7, "carbs_per_100": 3.7, "allergens": ["milk"]},
    {"code": "skyr-natural", "name": "Natural Skyr Icelandic yogurt", "unit": "g", "calories_per_100": 64, "protein_per_100": 12.0, "fat_per_100": 0.2, "carbs_per_100": 4.1, "allergens": ["milk"]},
    {"code": "milk-2-percent", "name": "Cow milk 2% fat", "unit": "ml", "calories_per_100": 50, "protein_per_100": 3.3, "fat_per_100": 2.0, "carbs_per_100": 4.8, "allergens": ["milk"]},
    {"code": "mozzarella-cheese", "name": "Mozzarella cheese", "unit": "g", "calories_per_100": 280, "protein_per_100": 22.0, "fat_per_100": 21.0, "carbs_per_100": 2.2, "allergens": ["milk"]},
    {"code": "rolled-oats", "name": "Rolled oats (Płatki owsiane górskie)", "unit": "g", "calories_per_100": 370, "protein_per_100": 13.0, "fat_per_100": 7.0, "carbs_per_100": 59.0, "allergens": ["gluten"]},
    {"code": "buckwheat-groats", "name": "Roasted buckwheat groats (Kasza gryczana)", "unit": "g", "calories_per_100": 343, "protein_per_100": 12.6, "fat_per_100": 3.1, "carbs_per_100": 69.3, "allergens": []},
    {"code": "basmati-rice", "name": "Basmati white rice (dry)", "unit": "g", "calories_per_100": 356, "protein_per_100": 7.5, "fat_per_100": 0.9, "carbs_per_100": 78.0, "allergens": []},
    {"code": "durum-pasta", "name": "Durum wheat pasta (dry)", "unit": "g", "calories_per_100": 359, "protein_per_100": 12.5, "fat_per_100": 1.8, "carbs_per_100": 71.5, "allergens": ["gluten"]},
    {"code": "wholegrain-rye-bread", "name": "Wholegrain rye sourdough bread", "unit": "g", "calories_per_100": 225, "protein_per_100": 6.4, "fat_per_100": 1.4, "carbs_per_100": 45.0, "allergens": ["gluten"]},
    {"code": "potatoes-raw", "name": "White potatoes", "unit": "g", "calories_per_100": 77, "protein_per_100": 2.0, "fat_per_100": 0.1, "carbs_per_100": 17.5, "allergens": []},
    {"code": "tofu-natural", "name": "Firm natural soy tofu", "unit": "g", "calories_per_100": 126, "protein_per_100": 13.5, "fat_per_100": 7.2, "carbs_per_100": 1.9, "allergens": ["soy"]},
    {"code": "chickpeas-cooked", "name": "Cooked chickpeas", "unit": "g", "calories_per_100": 164, "protein_per_100": 8.9, "fat_per_100": 2.6, "carbs_per_100": 27.4, "allergens": []},
    {"code": "red-lentils", "name": "Red lentils (dry)", "unit": "g", "calories_per_100": 352, "protein_per_100": 24.6, "fat_per_100": 1.1, "carbs_per_100": 60.1, "allergens": []},
    {"code": "avocado-fresh", "name": "Fresh Hass avocado", "unit": "g", "calories_per_100": 160, "protein_per_100": 2.0, "fat_per_100": 14.7, "carbs_per_100": 8.5, "allergens": []},
    {"code": "olive-oil", "name": "Extra virgin olive oil", "unit": "ml", "calories_per_100": 884, "protein_per_100": 0.0, "fat_per_100": 100.0, "carbs_per_100": 0.0, "allergens": []},
    {"code": "walnuts", "name": "Shelled walnuts", "unit": "g", "calories_per_100": 654, "protein_per_100": 15.2, "fat_per_100": 65.2, "carbs_per_100": 13.7, "allergens": ["nuts"]},
    {"code": "banana-fresh", "name": "Fresh banana", "unit": "g", "calories_per_100": 89, "protein_per_100": 1.1, "fat_per_100": 0.3, "carbs_per_100": 22.8, "allergens": []},
    {"code": "blueberries", "name": "Fresh blueberries (Borówka amerykańska)", "unit": "g", "calories_per_100": 57, "protein_per_100": 0.7, "fat_per_100": 0.3, "carbs_per_100": 14.5, "allergens": []},
    {"code": "broccoli-fresh", "name": "Fresh broccoli florets", "unit": "g", "calories_per_100": 34, "protein_per_100": 2.8, "fat_per_100": 0.4, "carbs_per_100": 6.6, "allergens": []},
    {"code": "spinach-leaves", "name": "Fresh baby spinach", "unit": "g", "calories_per_100": 23, "protein_per_100": 2.9, "fat_per_100": 0.4, "carbs_per_100": 3.6, "allergens": []},
]

# Fallback baseline Polish retail products (guarantees rich catalog even offline)
BASELINE_POLISH_PRODUCTS: List[dict] = [
    {"code": "mlekovita-twarog-poltlusty-250g", "name": "Mlekovita Twaróg Półtłusty", "category": "dairy", "unit": "g", "pack_quantity": 250, "pack_unit": "g", "calories_per_100": 133, "protein_per_100": 18.7, "fat_per_100": 4.7, "carbs_per_100": 3.7, "base_price": 4.49},
    {"code": "piatnica-skyr-naturalny-150g", "name": "Piątnica Skyr Jogurt Naturalny", "category": "dairy", "unit": "g", "pack_quantity": 150, "pack_unit": "g", "calories_per_100": 64, "protein_per_100": 12.0, "fat_per_100": 0.2, "carbs_per_100": 4.1, "base_price": 3.29},
    {"code": "laciate-mleko-uht-2-1000ml", "name": "Łaciate Mleko UHT 2%", "category": "dairy", "unit": "ml", "pack_quantity": 1000, "pack_unit": "ml", "calories_per_100": 50, "protein_per_100": 3.3, "fat_per_100": 2.0, "carbs_per_100": 4.8, "base_price": 4.19},
    {"code": "melvit-platki-owsiane-gorskie-500g", "name": "Melvit Płatki Owsiane Górskie", "category": "grains", "unit": "g", "pack_quantity": 500, "pack_unit": "g", "calories_per_100": 370, "protein_per_100": 13.0, "fat_per_100": 7.0, "carbs_per_100": 59.0, "base_price": 4.99},
    {"code": "kupiec-kasza-gryczana-prazona-400g", "name": "Kupiec Kasza Gryczana Prażona", "category": "grains", "unit": "g", "pack_quantity": 400, "pack_unit": "g", "calories_per_100": 343, "protein_per_100": 12.6, "fat_per_100": 3.1, "carbs_per_100": 69.3, "base_price": 6.49},
    {"code": "lubella-makaron-spaghetti-500g", "name": "Lubella Makaron Spaghetti Pełne Ziarno", "category": "grains", "unit": "g", "pack_quantity": 500, "pack_unit": "g", "calories_per_100": 351, "protein_per_100": 13.5, "fat_per_100": 2.2, "carbs_per_100": 66.0, "base_price": 5.79},
    {"code": "kraina-mies-filet-z-piersi-kurczaka-500g", "name": "Kraina Mięs Filet z Piersi Kurczaka", "category": "meat", "unit": "g", "pack_quantity": 500, "pack_unit": "g", "calories_per_100": 120, "protein_per_100": 22.5, "fat_per_100": 2.6, "carbs_per_100": 0.0, "base_price": 13.99},
    {"code": "sokolow-poledwiczki-z-kurczaka-400g", "name": "Sokołów Polędwiczki z Kurczaka", "category": "meat", "unit": "g", "pack_quantity": 400, "pack_unit": "g", "calories_per_100": 112, "protein_per_100": 23.0, "fat_per_100": 1.8, "carbs_per_100": 0.2, "base_price": 12.49},
    {"code": "marinero-filet-z-lososia-atlantyckiego-300g", "name": "Marinero Filet z Łososia Atlantyckiego", "category": "meat", "unit": "g", "pack_quantity": 300, "pack_unit": "g", "calories_per_100": 208, "protein_per_100": 20.4, "fat_per_100": 13.4, "carbs_per_100": 0.0, "base_price": 21.99},
    {"code": "polskie-tofu-naturalne-180g", "name": "Polsoja Tofu Naturalne", "category": "dairy", "unit": "g", "pack_quantity": 180, "pack_unit": "g", "calories_per_100": 126, "protein_per_100": 13.5, "fat_per_100": 7.2, "carbs_per_100": 1.9, "base_price": 5.49},
    {"code": "putka-chleb-zytni-razowy-500g", "name": "Putka Chleb Żytni Razowy", "category": "bakery", "unit": "g", "pack_quantity": 500, "pack_unit": "g", "calories_per_100": 225, "protein_per_100": 6.4, "fat_per_100": 1.4, "carbs_per_100": 45.0, "base_price": 6.29},
    {"code": "cisowianka-woda-niegazowana-1500ml", "name": "Cisowianka Woda Mineralna Niegazowana", "category": "beverages", "unit": "ml", "pack_quantity": 1500, "pack_unit": "ml", "calories_per_100": 0, "protein_per_100": 0.0, "fat_per_100": 0.0, "carbs_per_100": 0.0, "base_price": 2.49},
]

CURATED_RECIPES: List[dict] = [
    {
        "code": "high-protein-skyr-oats",
        "name": "High-Protein Skyr & Blueberry Oatmeal",
        "description": "Quick high-protein breakfast bowl with rolled oats, Icelandic skyr, and fresh blueberries.",
        "instructions": [
            "Simmer 60g rolled oats with 150ml milk or water for 5 minutes until creamy.",
            "Remove from heat and stir in 150g natural Skyr yogurt.",
            "Top with 70g fresh blueberries and 10g chopped walnuts."
        ],
        "servings": 1,
        "prep_minutes": 10,
        "dietary_tags": ["high-protein", "vegetarian"]
    },
    {
        "code": "grilled-chicken-buckwheat-bowl",
        "name": "Polish Buckwheat & Grilled Chicken Power Bowl",
        "description": "Balanced post-workout meal featuring roasted buckwheat groats, chicken breast, and steamed broccoli.",
        "instructions": [
            "Cook 80g dry roasted buckwheat groats in salted water for 15 minutes.",
            "Season 200g chicken breast with herbs and pan-sear for 6 minutes per side.",
            "Steam 150g broccoli florets for 5 minutes and serve with 10ml olive oil."
        ],
        "servings": 1,
        "prep_minutes": 25,
        "dietary_tags": ["high-protein", "gluten-free", "dairy-free"]
    },
    {
        "code": "crispy-tofu-chickpea-curry",
        "name": "Vegan Chickpea & Crispy Tofu Bowl",
        "description": "Plant-based protein bowl with pan-seared soy tofu, chickpeas, baby spinach, and basmati rice.",
        "instructions": [
            "Press and cube 180g firm tofu, then pan-sear until golden on all sides.",
            "Warm 120g cooked chickpeas with baby spinach and spices in the same pan.",
            "Serve over 80g cooked basmati rice with sliced avocado."
        ],
        "servings": 2,
        "prep_minutes": 20,
        "dietary_tags": ["vegan", "vegetarian", "dairy-free", "gluten-free"]
    },
    {
        "code": "seared-salmon-potatoes-spinach",
        "name": "Pan-Seared Atlantic Salmon with Young Potatoes",
        "description": "Omega-3 rich salmon fillet paired with boiled potatoes and wilted garlic spinach.",
        "instructions": [
            "Boil 220g halved potatoes until fork-tender (about 18 minutes).",
            "Sear 180g salmon fillet skin-side down for 4 minutes, flip and cook 3 minutes more.",
            "Wilt 100g fresh spinach in a teaspoon of olive oil and plate alongside."
        ],
        "servings": 1,
        "prep_minutes": 25,
        "dietary_tags": ["high-protein", "gluten-free", "dairy-free"]
    },
    {
        "code": "twarog-radish-rye-tartines",
        "name": "Traditional Polish Twaróg Rye Tartines",
        "description": "Classic Polish high-protein breakfast on wholegrain rye sourdough bread.",
        "instructions": [
            "Mash 150g semi-skimmed twaróg with 2 tablespoons of natural skyr and chopped chives.",
            "Spread generously over two slices (100g) of wholegrain rye sourdough bread.",
            "Season with freshly cracked black pepper and sea salt."
        ],
        "servings": 1,
        "prep_minutes": 8,
        "dietary_tags": ["high-protein", "vegetarian"]
    },
]

# Menu templates grouped by restaurant category
DISH_TEMPLATES: Dict[str, List[dict]] = {
    "polish": [
        {"name": "Pierogi Ruskie z Cebulką (10 szt.)", "category": "main", "price": 29.0, "grams": 380, "kcal": 640, "p": 22.0, "f": 18.0, "c": 96.0, "tags": ["vegetarian"], "allergens": ["gluten", "milk"]},
        {"name": "Żurek Łódzki w Chlebie z Jajkiem", "category": "soup", "price": 24.5, "grams": 450, "kcal": 510, "p": 19.0, "f": 21.0, "c": 61.0, "tags": [], "allergens": ["gluten", "eggs"]},
        {"name": "Kotlet Schabowy z Ziemniakami i Kapustą", "category": "main", "price": 36.0, "grams": 520, "kcal": 890, "p": 44.0, "f": 46.0, "c": 74.0, "tags": ["high-protein"], "allergens": ["gluten", "eggs"]},
        {"name": "Placki Ziemniaczane z Gulaszem Wołowym", "category": "main", "price": 38.5, "grams": 480, "kcal": 820, "p": 36.0, "f": 42.0, "c": 72.0, "tags": ["high-protein"], "allergens": ["gluten"]},
        {"name": "Barszcz Czerwony z Uszkami", "category": "soup", "price": 19.0, "grams": 350, "kcal": 290, "p": 9.0, "f": 6.0, "c": 49.0, "tags": ["vegan"], "allergens": ["gluten"]},
    ],
    "italian": [
        {"name": "Pizza Margherita Napoletana", "category": "main", "price": 32.0, "grams": 420, "kcal": 860, "p": 34.0, "f": 26.0, "c": 122.0, "tags": ["vegetarian"], "allergens": ["gluten", "milk"]},
        {"name": "Spaghetti alla Carbonara", "category": "main", "price": 37.0, "grams": 400, "kcal": 790, "p": 33.0, "f": 38.0, "c": 78.0, "tags": ["high-protein"], "allergens": ["gluten", "eggs", "milk"]},
        {"name": "Tagliatelle z Kurczakiem i Szpinakiem", "category": "main", "price": 36.5, "grams": 430, "kcal": 740, "p": 42.0, "f": 28.0, "c": 80.0, "tags": ["high-protein"], "allergens": ["gluten", "milk"]},
        {"name": "Sałatka Caprese z Mozzarellą", "category": "salad", "price": 27.0, "grams": 280, "kcal": 390, "p": 21.0, "f": 31.0, "c": 7.0, "tags": ["vegetarian", "gluten-free"], "allergens": ["milk"]},
        {"name": "Tiramisu Klasyczne", "category": "dessert", "price": 22.0, "grams": 180, "kcal": 460, "p": 8.0, "f": 28.0, "c": 44.0, "tags": ["vegetarian"], "allergens": ["gluten", "eggs", "milk"]},
    ],
    "kebab": [
        {"name": "Kebab Rollo z Kurczakiem (Duży)", "category": "main", "price": 27.0, "grams": 480, "kcal": 840, "p": 46.0, "f": 34.0, "c": 86.0, "tags": ["high-protein"], "allergens": ["gluten", "milk"]},
        {"name": "Kebab Box z Frytkami i Surówką", "category": "main", "price": 28.5, "grams": 500, "kcal": 910, "p": 42.0, "f": 46.0, "c": 82.0, "tags": ["high-protein"], "allergens": ["milk"]},
        {"name": "Falafel Wrap z Hummusem", "category": "main", "price": 25.0, "grams": 420, "kcal": 690, "p": 21.0, "f": 26.0, "c": 92.0, "tags": ["vegan", "vegetarian"], "allergens": ["gluten", "sesame"]},
        {"name": "Talerz Kebab Wołowo-Barani z Ryżem", "category": "main", "price": 34.0, "grams": 550, "kcal": 960, "p": 52.0, "f": 48.0, "c": 79.0, "tags": ["high-protein"], "allergens": ["milk"]},
    ],
    "healthy": [
        {"name": "Chicken & Avocado Quinoa Bowl", "category": "main", "price": 34.5, "grams": 420, "kcal": 560, "p": 44.0, "f": 19.0, "c": 52.0, "tags": ["high-protein", "gluten-free", "dairy-free"], "allergens": []},
        {"name": "Salmon Poke Bowl z Edamame", "category": "main", "price": 39.0, "grams": 440, "kcal": 610, "p": 36.0, "f": 22.0, "c": 66.0, "tags": ["high-protein", "dairy-free"], "allergens": ["fish", "soy"]},
        {"name": "Tofu & Roasted Sweet Potato Bowl", "category": "main", "price": 32.0, "grams": 430, "kcal": 520, "p": 24.0, "f": 18.0, "c": 65.0, "tags": ["vegan", "vegetarian", "gluten-free"], "allergens": ["soy"]},
        {"name": "Protein Skyr Smoothie z Borówkami", "category": "drink", "price": 19.5, "grams": 350, "kcal": 260, "p": 24.0, "f": 2.0, "c": 36.0, "tags": ["high-protein", "vegetarian", "gluten-free"], "allergens": ["milk"]},
    ],
    "asian": [
        {"name": "Pad Thai z Kurczakiem i Orzeszkami", "category": "main", "price": 35.0, "grams": 450, "kcal": 730, "p": 35.0, "f": 24.0, "c": 92.0, "tags": ["high-protein", "dairy-free"], "allergens": ["eggs", "nuts", "soy"]},
        {"name": "Ramen Tonkotsu z Boczkiem Chashu", "category": "soup", "price": 39.0, "grams": 600, "kcal": 820, "p": 38.0, "f": 39.0, "c": 78.0, "tags": ["high-protein"], "allergens": ["gluten", "eggs", "soy"]},
        {"name": "Curry Zielone z Tofu i Warzywami", "category": "main", "price": 33.0, "grams": 440, "kcal": 610, "p": 21.0, "f": 28.0, "c": 68.0, "tags": ["vegan", "gluten-free"], "allergens": ["soy"]},
        {"name": "Zestaw Sushi Hosomaki & Futomaki (16 szt.)", "category": "main", "price": 44.0, "grams": 380, "kcal": 540, "p": 26.0, "f": 11.0, "c": 84.0, "tags": ["dairy-free"], "allergens": ["fish", "soy"]},
    ],
    "cafe": [
        {"name": "Flat White na Mleku 2%", "category": "drink", "price": 15.0, "grams": 220, "kcal": 95, "p": 6.2, "f": 3.8, "c": 9.0, "tags": ["vegetarian", "gluten-free"], "allergens": ["milk"]},
        {"name": "Bajgiel z Łososiem Wędzonym i Serkiem", "category": "starter", "price": 24.0, "grams": 240, "kcal": 470, "p": 23.0, "f": 16.0, "c": 58.0, "tags": ["high-protein"], "allergens": ["gluten", "milk", "fish"]},
        {"name": "Owsianka Proteinowa z Masłem Orzechowym", "category": "starter", "price": 21.0, "grams": 320, "kcal": 490, "p": 21.0, "f": 15.0, "c": 66.0, "tags": ["vegetarian"], "allergens": ["gluten", "nuts"]},
        {"name": "Sernik Baskijki", "category": "dessert", "price": 20.0, "grams": 160, "kcal": 480, "p": 11.0, "f": 33.0, "c": 34.0, "tags": ["vegetarian"], "allergens": ["milk", "eggs", "gluten"]},
    ],
    "fast-food": [
        {"name": "Classic Smash Burger Wołowy z Frytkami", "category": "main", "price": 36.0, "grams": 490, "kcal": 980, "p": 46.0, "f": 52.0, "c": 82.0, "tags": ["high-protein"], "allergens": ["gluten", "milk", "eggs"]},
        {"name": "Grilled Chicken Burger Pełnoziarnisty", "category": "main", "price": 31.0, "grams": 380, "kcal": 590, "p": 39.0, "f": 18.0, "c": 66.0, "tags": ["high-protein"], "allergens": ["gluten"]},
        {"name": "Plant-Based Burger z Frytkami z Batatów", "category": "main", "price": 35.0, "grams": 450, "kcal": 780, "p": 24.0, "f": 34.0, "c": 94.0, "tags": ["vegan", "vegetarian"], "allergens": ["gluten", "soy"]},
    ],
    "bakery": [
        {"name": "Kanapka Razowa z Kurczakiem i Warzywami", "category": "starter", "price": 14.5, "grams": 220, "kcal": 380, "p": 22.0, "f": 9.0, "c": 52.0, "tags": ["high-protein"], "allergens": ["gluten"]},
        {"name": "Drożdżówka z Twarogiem", "category": "dessert", "price": 7.5, "grams": 130, "kcal": 390, "p": 12.0, "f": 11.0, "c": 60.0, "tags": ["vegetarian"], "allergens": ["gluten", "milk", "eggs"]},
        {"name": "Rogal Pełnoziarnisty z Ziarnami", "category": "starter", "price": 5.5, "grams": 110, "kcal": 310, "p": 11.0, "f": 7.0, "c": 50.0, "tags": ["vegan"], "allergens": ["gluten"]},
    ],
}


class DomainEnricher:
    """Builds ingredients, recipes, restaurant dishes, and chain-priced store catalog items."""

    def __init__(self, config: SeederConfig) -> None:
        self.config = config
        self.rng = random.Random(config.random_seed)

    def get_ingredients(self) -> List[IngredientIn]:
        return [IngredientIn(**item) for item in CURATED_INGREDIENTS]

    def get_recipes(self) -> List[RecipeIn]:
        return [RecipeIn(**item) for item in CURATED_RECIPES]

    def get_baseline_products(self, code_registry: CodeRegistry) -> Tuple[List[ProductIn], Dict[str, float]]:
        products: List[ProductIn] = []
        base_prices: Dict[str, float] = {}
        for raw in BASELINE_POLISH_PRODUCTS:
            data = dict(raw)
            base_price = data.pop("base_price")
            code = code_registry.register(data["code"])
            data["code"] = code
            products.append(ProductIn(**data))
            base_prices[code] = base_price
        return products, base_prices

    def generate_dishes_for_restaurants(
        self,
        restaurants: List[RestaurantIn],
        code_registry: CodeRegistry,
    ) -> List[DishIn]:
        dishes: List[DishIn] = []
        fallback_menu = DISH_TEMPLATES["polish"] + DISH_TEMPLATES["healthy"]

        for rest in restaurants:
            templates = DISH_TEMPLATES.get(rest.category or "", fallback_menu)
            count = min(self.config.dishes_per_restaurant, len(templates))
            chosen = self.rng.sample(templates, k=count)

            for tpl in chosen:
                # Apply slight realistic per-venue price variance (+/- 10%)
                price = round(tpl["price"] * self.rng.uniform(0.92, 1.12), 2)
                code = code_registry.register(f"{rest.code}-{tpl['name']}")
                dishes.append(
                    DishIn(
                        code=code,
                        restaurant_code=rest.code,
                        name=tpl["name"],
                        description=f"{tpl['name']} — served at {rest.name} ({rest.city})",
                        category=tpl["category"],
                        price_pln=price,
                        serving_grams=tpl["grams"],
                        calories=tpl["kcal"],
                        protein=tpl["p"],
                        fat=tpl["f"],
                        carbs=tpl["c"],
                        dietary_tags=list(tpl["tags"]),
                        allergens=list(tpl["allergens"]),
                    )
                )
        return dishes

    @staticmethod
    def _chain_price_multiplier(store_name: str) -> float:
        lower = store_name.lower()
        if "żabka" in lower or "zabka" in lower:
            return 1.22  # Convenience store markup
        if any(discount in lower for discount in ("biedronka", "lidl", "auchan", "kaufland", "aldi", "netto")):
            return 0.94  # Supermarket / discounter pricing
        if "carrefour" in lower or "stokrotka" in lower or "lewiatan" in lower:
            return 1.02
        return 1.05

    @staticmethod
    def _estimate_base_price(product: ProductIn) -> float:
        cat_defaults = {
            "dairy": 4.79,
            "grains": 5.49,
            "meat": 15.99,
            "produce": 6.49,
            "beverages": 3.49,
            "snacks": 6.99,
            "bakery": 5.29,
            "breakfast": 8.49,
        }
        return cat_defaults.get(product.category or "", 6.99)

    def generate_store_catalog_items(
        self,
        stores: List[StoreIn],
        products: List[ProductIn],
        known_prices: Dict[str, float],
    ) -> List[StoreCatalogItemIn]:
        if not stores or not products:
            return []

        items: List[StoreCatalogItemIn] = []
        sample_size = max(1, min(len(products), int(len(products) * self.config.products_per_store_ratio)))

        for store in stores:
            multiplier = self._chain_price_multiplier(store.name)
            # Convenience stores like Żabka carry a smaller subset of products
            store_sample_size = max(1, int(sample_size * 0.45)) if "żabka" in store.name.lower() else sample_size
            assortment = self.rng.sample(products, k=min(store_sample_size, len(products)))

            for prod in assortment:
                base_price = known_prices.get(prod.code) or self._estimate_base_price(prod)
                jitter = self.rng.uniform(0.97, 1.04)
                final_price = round(base_price * multiplier * jitter, 2)
                available = self.rng.random() > 0.06  # ~94% in-stock rate

                items.append(
                    StoreCatalogItemIn(
                        store_code=store.code,
                        product_code=prod.code,
                        price_pln=final_price,
                        available=available,
                    )
                )

        return items
