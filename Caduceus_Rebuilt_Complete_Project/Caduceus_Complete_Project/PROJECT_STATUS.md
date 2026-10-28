# Project scope and verification status

## Implemented in this package

- Docker Compose stack with PostgreSQL, FastAPI and React/Vite.
- 15 core SQLAlchemy models and an initial Alembic migration.
- JWT registration/login/current-user authentication.
- Dietary preferences, restaurant/dish catalog search, coordinates/nearby lookup, meal diary and daily macro totals, recipes, shopping lists and catalog JSON import.
- Optional authenticated OpenAI food-image estimate flow with upload type/size checks and a separate user-confirmation endpoint.
- Interactive Leaflet map and browser geolocation in the web UI.
- Expo/React Native starter documentation.

## Intentionally not bundled

- A large fabricated restaurant database for Łódź.
- Claimed-live Biedronka/Dino prices or a product database without a verified data source.
- pgvector/RAG, Redis/Celery jobs, payment systems, production hosting or a finished native mobile client.

These are later stages; the app has schema and extension points but should not be described as already having those features.

## Checks performed when packaging

- Python source files and Alembic migration files passed `compileall` syntax checks.
- The frontend dependency manifest now pins versions instead of using `latest`.
- The Compose web build context is explicitly `./frontend`; API context is `./backend`.

A full Docker image build, PostgreSQL migration run and browser build could not be executed in this packaging environment. Run `docker compose up --build` on the target machine to verify the complete local stack.
