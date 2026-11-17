"""
catalog_seeder — Modular ETL & Synthetic Enrichment Pipeline for Łódź Catalog Data.

Fetches real geospatial venues (restaurants, cafes, supermarkets, convenience stores)
from OpenStreetMap Overpass API and real Polish grocery products from Open Food Facts,
enriches them with domain-accurate nutrition data, menus, recipes, and chain-specific
pricing, validates everything against Pydantic v2 schemas, and exports JSON or pushes
directly in batches to POST /catalog/import-json.
"""

from .config import SeederConfig
from .pipeline import LodzCatalogPipeline
from .schemas import CatalogPayload

__all__ = ["SeederConfig", "LodzCatalogPipeline", "CatalogPayload"]
