import argparse
import logging
from pathlib import Path

from .config import SeederConfig
from .pipeline import LodzCatalogPipeline


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        prog="python -m catalog_seeder",
        description="Build and optionally ingest a full-city Łódź JSON catalog for POST /catalog/import-json.",
    )
    parser.add_argument(
        "-o", "--output",
        type=Path,
        default=Path("lodz_catalog.json"),
        help="Destination path for the generated JSON file (default: lodz_catalog.json)",
    )
    parser.add_argument(
        "--from-json",
        type=Path,
        default=None,
        help="Load an existing validated JSON file instead of re-fetching external APIs",
    )
    parser.add_argument(
        "--dishes-per-restaurant",
        type=int,
        default=5,
        help="Number of menu dishes generated per restaurant (default: 5)",
    )
    parser.add_argument(
        "--off-per-category",
        type=int,
        default=45,
        help="Max products fetched per category from Open Food Facts (default: 45)",
    )
    parser.add_argument(
        "--skip-off",
        action="store_true",
        help="Skip Open Food Facts HTTP queries and use curated Polish baseline products only",
    )
    parser.add_argument(
        "--push-url",
        type=str,
        default=None,
        help="Optional FastAPI base URL (e.g. http://localhost:8000) to push data directly in batches",
    )
    parser.add_argument(
        "--token",
        type=str,
        default=None,
        help="Optional Bearer JWT token for authenticated POST /catalog/import-json requests",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=250,
        help="Chunk size when pushing entities to the API (default: 250)",
    )
    return parser.parse_args()


def main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
    )
    args = parse_args()

    config = SeederConfig(
        output_path=args.output,
        dishes_per_restaurant=args.dishes_per_restaurant,
        off_products_per_category=args.off_per_category,
        api_base_url=args.push_url,
        bearer_token=args.token,
        batch_size=args.batch_size,
    )

    pipeline = LodzCatalogPipeline(config)

    if args.from_json:
        payload = pipeline.load_json(args.from_json)
    else:
        payload = pipeline.build(skip_off=args.skip_off)
        pipeline.export_json(payload)

    if args.push_url:
        pipeline.push_to_api(payload)


if __name__ == "__main__":
    main()