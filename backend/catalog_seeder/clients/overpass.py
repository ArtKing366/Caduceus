import logging
import time
from typing import Any, Dict, List, Tuple
import httpx

from ..config import SeederConfig
from ..schemas import RestaurantIn, StoreIn
from ..utils import CodeRegistry

logger = logging.getLogger(__name__)


class OverpassClient:
    """Fetches real restaurants and retail food stores within Łódź from OpenStreetMap."""

    def __init__(self, config: SeederConfig) -> None:
        self.config = config
        self.headers = {
            "User-Agent": "CaduceusAcademicCatalogSeeder/1.0 (University of Lodz CS Project)"
        }

    def _build_query(self) -> str:
        return f"""
        [out:json][timeout:{self.config.overpass_timeout_sec}];
        area["name"="{self.config.city_name}"]["admin_level"="{self.config.admin_level}"]->.lodz;
        (
          nwr["amenity"~"^(restaurant|cafe|fast_food|food_court|bakery)$"](area.lodz);
          nwr["shop"~"^(supermarket|convenience|bakery|greengrocer|butcher|health_food)$"](area.lodz);
        );
        out center tags;
        """

    def fetch_raw_elements(self) -> List[Dict[str, Any]]:
        query = self._build_query()
        last_error: Exception | None = None

        with httpx.Client(headers=self.headers, follow_redirects=True) as client:
            for endpoint in self.config.overpass_endpoints:
                for attempt in range(1, 3):
                    try:
                        logger.info("Querying Overpass API (%s, attempt %d)...", endpoint, attempt)
                        resp = client.post(
                            endpoint,
                            data={"data": query},
                            timeout=self.config.overpass_timeout_sec + 15,
                        )
                        resp.raise_for_status()
                        payload = resp.json()
                        elements = payload.get("elements", [])
                        logger.info("Fetched %d raw OSM elements for %s.", len(elements), self.config.city_name)
                        return elements
                    except Exception as exc:
                        last_error = exc
                        logger.warning("Overpass request failed on %s: %s", endpoint, exc)
                        time.sleep(2 * attempt)

        raise RuntimeError(f"All Overpass API endpoints failed: {last_error}")

    @staticmethod
    def _extract_coords(el: Dict[str, Any]) -> Tuple[float | None, float | None]:
        if "lat" in el and "lon" in el:
            return round(float(el["lat"]), 6), round(float(el["lon"]), 6)
        center = el.get("center")
        if isinstance(center, dict) and "lat" in center and "lon" in center:
            return round(float(center["lat"]), 6), round(float(center["lon"]), 6)
        return None, None

    @staticmethod
    def _extract_address(tags: Dict[str, str]) -> str | None:
        street = tags.get("addr:street")
        housenumber = tags.get("addr:housenumber")
        if street and housenumber:
            return f"{street} {housenumber}"
        if street:
            return street
        return None

    @staticmethod
    def _map_restaurant_category(tags: Dict[str, str]) -> str:
        amenity = tags.get("amenity", "")
        cuisine = tags.get("cuisine", "").lower()

        if "kebab" in cuisine or "turkish" in cuisine:
            return "kebab"
        if any(k in cuisine for k in ("pizza", "italian", "pasta")):
            return "italian"
        if any(k in cuisine for k in ("polish", "regional", "pierogi")):
            return "polish"
        if any(k in cuisine for k in ("asian", "sushi", "ramen", "vietnamese", "thai", "chinese", "indian")):
            return "asian"
        if any(k in cuisine for k in ("vegan", "vegetarian", "healthy", "salad", "fit")):
            return "healthy"
        if amenity == "cafe" or "coffee" in cuisine:
            return "cafe"
        if amenity == "bakery":
            return "bakery"
        if amenity == "fast_food" or "burger" in cuisine:
            return "fast-food"
        return "restaurant"

    def fetch_lodz_venues(self) -> Tuple[List[RestaurantIn], List[StoreIn]]:
        elements = self.fetch_raw_elements()
        restaurant_codes = CodeRegistry()
        store_codes = CodeRegistry()

        restaurants: List[RestaurantIn] = []
        stores: List[StoreIn] = []

        for el in elements:
            tags = el.get("tags") or {}
            name = (tags.get("name") or tags.get("brand") or "").strip()
            if not name:
                continue

            lat, lon = self._extract_coords(el)
            address = self._extract_address(tags)
            osm_id = el.get("id")

            amenity = tags.get("amenity")
            shop = tags.get("shop")

            if amenity in {"restaurant", "cafe", "fast_food", "food_court", "bakery"}:
                category = self._map_restaurant_category(tags)
                cuisine_raw = tags.get("cuisine")
                desc = f"{amenity.replace('_', ' ').title()} in Łódź"
                if cuisine_raw:
                    desc += f" ({cuisine_raw.replace(';', ', ')})"

                code = restaurant_codes.register(f"lodz-{name}", osm_id)
                restaurants.append(
                    RestaurantIn(
                        code=code,
                        name=name,
                        description=desc,
                        category=category,
                        address=address,
                        city=self.config.city_name,
                        latitude=lat,
                        longitude=lon,
                        is_active=True,
                    )
                )

            elif shop in {"supermarket", "convenience", "bakery", "greengrocer", "butcher", "health_food"}:
                code = store_codes.register(f"lodz-{name}", osm_id)
                stores.append(
                    StoreIn(
                        code=code,
                        name=name,
                        address=address,
                        city=self.config.city_name,
                        latitude=lat,
                        longitude=lon,
                    )
                )

        logger.info("Parsed %d restaurants and %d stores in Łódź.", len(restaurants), len(stores))
        return restaurants, stores
