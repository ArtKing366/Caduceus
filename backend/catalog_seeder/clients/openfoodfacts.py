import logging
import re
import time
from typing import Any, Dict, List, Tuple
import httpx

from ..config import SeederConfig
from ..schemas import ProductIn
from ..utils import CodeRegistry

logger = logging.getLogger(__name__)

# Canonical Open Food Facts v2 category tags paired with internal categories
OFF_CATEGORIES: List[Tuple[str, str]] = [
    ("en:dairies", "dairy"),
    ("en:breads", "bakery"),
    ("en:cereals-and-potatoes", "grains"),
    ("en:meats", "meat"),
    ("en:fruits-and-vegetables-based-foods", "produce"),
    ("en:beverages", "beverages"),
    ("en:snacks", "snacks"),
    ("en:breakfasts", "breakfast"),
]


class OpenFoodFactsClient:
    """Fetches real Polish retail food products with nutrition facts from Open Food Facts API v2."""

    def __init__(self, config: SeederConfig) -> None:
        self.config = config
        self.headers = {
            "User-Agent": "CaduceusAcademicCatalogSeeder/1.0 (University of Lodz CS Project)"
        }

    @staticmethod
    def _parse_quantity(raw_qty: str | None) -> Tuple[float, str, str]:
        """Extract (pack_quantity, pack_unit, base_unit) from strings like '500 g', '1 l', '250ml'."""
        if not raw_qty:
            return 500.0, "g", "g"
        match = re.search(r"(\d+(?:[.,]\d+)?)\s*(kg|g|ml|l)\b", raw_qty.lower())
        if not match:
            return 500.0, "g", "g"

        val = float(match.group(1).replace(",", "."))
        unit = match.group(2)

        if unit == "kg":
            return round(val * 1000, 1), "g", "g"
        if unit == "l":
            return round(val * 1000, 1), "ml", "ml"
        if unit == "ml":
            return round(val, 1), "ml", "ml"
        return round(val, 1), "g", "g"

    @staticmethod
    def _extract_macros(nutriments: Dict[str, Any]) -> Tuple[float, float, float, float] | None:
        kcal = nutriments.get("energy-kcal_100g")
        protein = nutriments.get("proteins_100g")
        fat = nutriments.get("fat_100g")
        carbs = nutriments.get("carbohydrates_100g")

        if kcal is None or protein is None or fat is None or carbs is None:
            return None

        try:
            kcal_f = round(float(kcal), 1)
            prot_f = round(float(protein), 1)
            fat_f = round(float(fat), 1)
            carb_f = round(float(carbs), 1)
        except (TypeError, ValueError):
            return None

        if not (0 <= kcal_f <= 950 and 0 <= prot_f <= 100 and 0 <= fat_f <= 100 and 0 <= carb_f <= 100):
            return None

        return kcal_f, prot_f, fat_f, carb_f

    def fetch_polish_products(self, code_registry: CodeRegistry) -> List[ProductIn]:
        products: List[ProductIn] = []
        search_url = "https://world.openfoodfacts.org/api/v2/search"

        with httpx.Client(headers=self.headers, follow_redirects=True) as client:
            for off_tag, internal_category in OFF_CATEGORIES:
                params = {
                    "countries_tags_en": "poland",
                    "categories_tags_en": off_tag,
                    "page_size": self.config.off_products_per_category,
                    "fields": "code,product_name,product_name_pl,brands,quantity,nutriments",
                }
                raw_products: List[Dict[str, Any]] = []
                for attempt in range(1, 3):
                    try:
                        resp = client.get(
                            search_url,
                            params=params,
                            timeout=self.config.off_timeout_sec,
                        )
                        if resp.status_code == 503:
                            time.sleep(1.5 * attempt)
                            continue
                        resp.raise_for_status()
                        raw_products = resp.json().get("products", [])
                        break
                    except Exception as exc:
                        logger.warning("Open Food Facts query failed for '%s' (attempt %d): %s", off_tag, attempt, exc)
                        time.sleep(1.0 * attempt)

                for item in raw_products:
                    raw_name = (item.get("product_name_pl") or item.get("product_name") or "").strip()
                    if len(raw_name) < 3:
                        continue

                    macros = self._extract_macros(item.get("nutriments") or {})
                    if macros is None:
                        continue

                    brand = (item.get("brands") or "").split(",")[0].strip()
                    display_name = (
                        f"{brand} {raw_name}".strip()
                        if brand and brand.lower() not in raw_name.lower()
                        else raw_name
                    )[:120]

                    pack_qty, pack_unit, base_unit = self._parse_quantity(item.get("quantity"))
                    barcode = item.get("code")
                    code = code_registry.register(f"{display_name}-{int(pack_qty)}{pack_unit}", barcode)

                    kcal, prot, fat, carbs = macros
                    products.append(
                        ProductIn(
                            code=code,
                            name=display_name,
                            category=internal_category,
                            unit=base_unit,
                            pack_quantity=pack_qty,
                            pack_unit=pack_unit,
                            calories_per_100=kcal,
                            protein_per_100=prot,
                            fat_per_100=fat,
                            carbs_per_100=carbs,
                        )
                    )
                time.sleep(0.3)

        logger.info("Fetched %d validated Polish retail products from Open Food Facts.", len(products))
        return products