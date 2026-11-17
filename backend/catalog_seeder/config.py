from dataclasses import dataclass, field
from pathlib import Path
from typing import List


@dataclass(slots=True)
class SeederConfig:
    """Configuration for the Łódź catalog data pipeline."""

    city_name: str = "Łódź"
    admin_level: str = "6"
    output_path: Path = Path("lodz_catalog.json")

    # OpenStreetMap Overpass API endpoints (with automatic failover)
    overpass_endpoints: List[str] = field(
        default_factory=lambda: [
            "https://overpass-api.de/api/interpreter",
            "https://overpass.kumi.systems/api/interpreter",
            "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
        ]
    )
    overpass_timeout_sec: int = 90

    # Open Food Facts settings
    off_base_url: str = "https://pl.openfoodfacts.org/cgi/search.pl"
    off_products_per_category: int = 45
    off_timeout_sec: int = 25

    # Enrichment & scaling controls
    dishes_per_restaurant: int = 5
    products_per_store_ratio: float = 0.65
    random_seed: int = 42

    # Optional direct API ingestion (POST /catalog/import-json)
    api_base_url: str | None = None
    bearer_token: str | None = None
    batch_size: int = 250
