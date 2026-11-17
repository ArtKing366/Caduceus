import json
import logging
from pathlib import Path
from typing import Any, Dict, Iterable, List, TypeVar
import httpx

from .clients.openfoodfacts import OpenFoodFactsClient
from .clients.overpass import OverpassClient
from .config import SeederConfig
from .generators.domain_enricher import DomainEnricher
from .schemas import CatalogPayload
from .utils import CodeRegistry

logger = logging.getLogger(__name__)
T = TypeVar("T")


def _chunked(items: List[T], size: int) -> Iterable[List[T]]:
    for idx in range(0, len(items), size):
        yield items[idx : idx + size]


def _upload_json_batch(client: httpx.Client, endpoint: str, body: Dict[str, Any]) -> None:
    """Send a JSON payload batch as multipart/form-data under the `file` field."""
    raw_bytes = json.dumps(body, ensure_ascii=False).encode("utf-8")
    files = {"file": ("catalog_batch.json", raw_bytes, "application/json")}
    resp = client.post(endpoint, files=files)
    if resp.status_code >= 400:
        logger.error(
            "API rejected batch (%d %s) for keys=%s: %s",
            resp.status_code,
            resp.reason_phrase,
            list(body.keys()),
            resp.text[:1500],
        )
        resp.raise_for_status()


class LodzCatalogPipeline:
    """End-to-end ETL & synthetic enrichment orchestrator for the Łódź catalog."""

    def __init__(self, config: SeederConfig | None = None) -> None:
        self.config = config or SeederConfig()
        self.overpass = OverpassClient(self.config)
        self.off = OpenFoodFactsClient(self.config)
        self.enricher = DomainEnricher(self.config)

    def build(self, skip_off: bool = False) -> CatalogPayload:
        """Fetch real data, enrich domain entities, and validate the full catalog payload."""
        restaurants, stores = self.overpass.fetch_lodz_venues()

        product_codes = CodeRegistry()
        products, known_prices = self.enricher.get_baseline_products(product_codes)

        if not skip_off:
            off_products = self.off.fetch_polish_products(product_codes)
            products.extend(off_products)

        ingredients = self.enricher.get_ingredients()
        recipes = self.enricher.get_recipes()

        dish_codes = CodeRegistry()
        dishes = self.enricher.generate_dishes_for_restaurants(restaurants, dish_codes)
        store_catalog_items = self.enricher.generate_store_catalog_items(stores, products, known_prices)

        payload = CatalogPayload(
            restaurants=restaurants,
            ingredients=ingredients,
            dishes=dishes,
            recipes=recipes,
            stores=stores,
            products=products,
            store_catalog_items=store_catalog_items,
        )
        logger.info(
            "Built validated Łódź catalog: %d restaurants, %d dishes, %d stores, %d products, %d store_catalog_items.",
            len(payload.restaurants),
            len(payload.dishes),
            len(payload.stores),
            len(payload.products),
            len(payload.store_catalog_items),
        )
        return payload

    def export_json(self, payload: CatalogPayload, output_path: Path | None = None) -> Path:
        target = output_path or self.config.output_path
        target.parent.mkdir(parents=True, exist_ok=True)
        serialized = json.dumps(payload.model_dump(), ensure_ascii=False, indent=2)
        target.write_text(serialized, encoding="utf-8")
        logger.info("Saved catalog JSON to %s (%.2f MB).", target, target.stat().st_size / (1024 * 1024))
        return target

    @staticmethod
    def load_json(input_path: Path) -> CatalogPayload:
        raw = json.loads(input_path.read_text(encoding="utf-8"))
        return CatalogPayload.model_validate(raw)

    def push_to_api(self, payload: CatalogPayload) -> None:
        """Upsert the generated catalog into POST /catalog/import-json as multipart file batches."""
        if not self.config.api_base_url:
            raise ValueError("api_base_url must be configured before pushing to API.")

        endpoint = f"{self.config.api_base_url.rstrip('/')}/catalog/import-json"
        headers: Dict[str, str] = {}
        if self.config.bearer_token:
            headers["Authorization"] = f"Bearer {self.config.bearer_token}"

        with httpx.Client(headers=headers, timeout=60.0) as client:
            # Phase 1: Master entities (no foreign-key dependencies)
            for key, records in (
                ("restaurants", payload.restaurants),
                ("ingredients", payload.ingredients),
                ("recipes", payload.recipes),
                ("stores", payload.stores),
                ("products", payload.products),
            ):
                for chunk in _chunked(records, self.config.batch_size):
                    logger.info("Uploading %d %s to %s...", len(chunk), key, endpoint)
                    _upload_json_batch(client, endpoint, {key: [r.model_dump() for r in chunk]})

            # Phase 2: Dependent entities (dishes & store_catalog_items)
            for dish_chunk in _chunked(payload.dishes, self.config.batch_size):
                logger.info("Uploading %d dishes to %s...", len(dish_chunk), endpoint)
                _upload_json_batch(client, endpoint, {"dishes": [d.model_dump() for d in dish_chunk]})

            for item_chunk in _chunked(payload.store_catalog_items, self.config.batch_size):
                logger.info("Uploading %d store_catalog_items to %s...", len(item_chunk), endpoint)
                _upload_json_batch(
                    client, endpoint, {"store_catalog_items": [i.model_dump() for i in item_chunk]}
                )

        logger.info("Successfully ingested complete Łódź catalog into API.")