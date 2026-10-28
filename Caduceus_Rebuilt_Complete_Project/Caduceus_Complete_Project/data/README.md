# Catalog JSON data

No bulk demo data is bundled. You can build a JSON catalog later and import it through `POST /catalog/import-json` in Swagger or from an authenticated client.

Expected top-level keys are optional arrays:
- `restaurants`: code, name, and optional description/category/address/city/latitude/longitude/is_active
- `ingredients`: code, name, unit, calories_per_100, protein_per_100, fat_per_100, carbs_per_100, allergens
- `dishes`: code, restaurant_code, name, optional description/category/price_pln/serving_grams/calories/protein/fat/carbs/dietary_tags/allergens
- `recipes`: code, name, optional description/instructions/servings/prep_minutes/dietary_tags
- `stores`: code, name, optional address/city/latitude/longitude
- `products`: code, name, optional category/unit/pack_quantity/pack_unit and macros per 100
- `store_catalog_items`: store_code, product_code, price_pln, optional available

Use unique `code` values for stable import/upsert behavior. For example payload, see `catalog.example.json`.
