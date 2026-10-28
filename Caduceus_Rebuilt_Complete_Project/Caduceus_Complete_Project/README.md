# Caduceus — Intelligent Nutrition Assistant

Standalone full-stack educational project. It is separate from TaskFlow and does not need files from another repository.

## Included

- **Web:** React + TypeScript + Vite, responsive UI, Leaflet/OpenStreetMap map and browser geolocation.
- **API:** Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2, JWT auth, Argon2 password hashing, Alembic migrations.
- **Database:** PostgreSQL 16. The initial migration creates the 15 core tables for users, dietary preferences, restaurants, dishes, ingredients, dish ingredients, recipes, recipe ingredients, stores, products, store catalogue/prices, meal diary, shopping lists/items, and food-photo scan sessions.
- **Food diary:** manual meal logging and daily calorie/macronutrient totals.
- **Restaurant explorer:** restaurant/dish search, coordinates, map markers, and nearby lookup. The catalogue starts empty until data is imported.
- **Recipes and groceries:** recipe and ingredient models/API, shopping lists, store/product/price models.
- **AI food photo scan:** optional server-side OpenAI vision integration. The user must review/correct estimates before saving them to the diary. Requires `OPENAI_API_KEY`; without it the rest of the app still runs.
- **Mobile:** Expo/React Native starter guide; the current runnable client is the web frontend.
- **Tests:** API smoke test; API docs at `/docs`.

**Data scope:** there is intentionally no fabricated bulk database of Łódź restaurants, Biedronka/Dino products or prices. The app supports importing your own catalogue JSON; example format is in `data/catalog.example.json`. The database starts with schema, not a large fake dataset. Real store/restaurant data needs a reliable source and should not be presented as live pricing without verification.

## Start on Windows

Requirements: Docker Desktop running, Docker Compose v2.

1. Extract this ZIP into a new folder.
2. Open CMD in the folder containing `docker-compose.yml`.
3. Create local env file:
   ```cmd
   copy .env.example .env
   ```
4. Start the whole stack:
   ```cmd
   docker compose up --build
   ```
   First build may take several minutes while Docker downloads base images and installs dependencies.
5. Open:
   - Web UI: http://localhost:5173
   - API docs: http://localhost:8000/docs
   - API health: http://localhost:8000/health
   - PostgreSQL port on host: `localhost:5434`

Compose starts PostgreSQL, waits for its health check, applies Alembic migrations, starts FastAPI, waits for the API health check, then starts the web UI. The web service is called `web`, but its source folder is `frontend`; the API source folder is `backend`.

## If Docker fails

Run these from the project root and share the **first actual ERROR block** if it fails:

```cmd
docker compose config
docker compose build --no-cache web
docker compose build --no-cache api
docker compose up
```

The frontend uses pinned package versions rather than `latest` and a current Node base image/npm to avoid resolving an unpredictable dependency tree. Do not delete the PostgreSQL volume just to rebuild images.

## Data persistence and reset

- `docker compose down` stops/removes containers but preserves the named PostgreSQL volume.
- `docker compose down -v` deletes the database volume and all data. Only use this if you explicitly want a database reset.
- To inspect logs: `docker compose logs -f api`, `docker compose logs -f web`, `docker compose logs -f db`.

## AI photo scan setup

Open `.env` and set `OPENAI_API_KEY` to your own key. The key is read only by the backend; do not put it in frontend source. Rebuild/restart the API after changing env:

```cmd
docker compose up --build -d api
```

Authenticated endpoint: `POST /food-scan/analyze` (multipart form field `image`), then review the estimate and submit corrections to `POST /food-scan/{scan_id}/confirm`. Accepted image types: JPEG, PNG, WebP; maximum 8 MB. Estimates are not medical advice or exact nutrition measurements.

## Importing catalogue data

See `data/README.md`. The import endpoint is authenticated. Use stable unique `code` fields and test imports with a small file first. Do not upload untrusted JSON.

## Run backend outside Docker

Use Python 3.12 and a reachable PostgreSQL instance. In Windows CMD:

```cmd
cd backend
py -m venv .venv
.venv\Scripts\activate
py -m pip install -r requirements.txt
set DATABASE_URL=postgresql+psycopg://caduceus:change_me_local@localhost:5434/caduceus
set SECRET_KEY=replace_this_with_a_long_random_secret
py -m alembic upgrade head
py -m uvicorn app.main:app --reload
```

For frontend-only development, run `npm install` then `npm run dev` from `frontend`. Use `VITE_API_URL` to point at the API.

## Current scope and next stages

The base application is implemented as a runnable starter, not a fully populated production service. Next stages can add a vetted Łódź restaurant dataset, verified store/product prices, richer recipe costing (used quantity vs whole pack), pgvector/RAG, Redis/Celery, mobile app screens, and production deployment with HTTPS, backups, rate limiting and monitoring. pgvector is deliberately not enabled in the initial migration, so a plain PostgreSQL 16 image works out of the box.
