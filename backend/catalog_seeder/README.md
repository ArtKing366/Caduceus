# `catalog_seeder` — Łódź Catalog ETL & Enrichment Module

Modular data ingestion and synthetic enrichment pipeline designed to populate the catalog database via `POST /catalog/import-json`.

## Architecture

```text
catalog_seeder/
├── __init__.py               # Public package API
├── __main__.py               # CLI entrypoint (`python -m catalog_seeder`)
├── config.py                 # Typed dataclass configuration (SeederConfig)
├── schemas.py                # Pydantic v2 validation contracts matching POST /catalog/import-json
├── utils.py                  # Polish diacritics slugifier & collision-safe CodeRegistry
├── clients/
│   ├── overpass.py           # OpenStreetMap Overpass API client (all Łódź restaurants & stores)
│   └── openfoodfacts.py      # Open Food Facts client (Polish grocery products & macros)
├── generators/
│   └── domain_enricher.py    # Ingredients, recipes, category-aware menus, chain pricing
└── pipeline.py               # Orchestrator: extract -> transform -> validate -> JSON / batch API push
```

## Usage

### 1. Generate full Łódź JSON file
```bash
python -m catalog_seeder --output data/lodz_catalog.json
```

### 2. Generate and immediately push in batches to FastAPI
```bash
python -m catalog_seeder   --output data/lodz_catalog.json   --push-url http://localhost:8000   --token "<YOUR_JWT_TOKEN>"   --batch-size 250
```
