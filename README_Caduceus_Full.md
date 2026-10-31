# Caduceus — Intelligent Nutrition Assistant

Caduceus is a standalone full-stack nutrition-assistant project. It combines a React web interface, a FastAPI backend, and PostgreSQL storage. The current package is a working starter for local development; it is **not yet a fully populated production service**.

## Contents

- [What is implemented](#what-is-implemented)
- [Technology stack](#technology-stack)
- [Architecture and request flow](#architecture-and-request-flow)
- [Project structure](#project-structure)
- [Run with Docker](#run-with-docker)
- [Useful Docker commands](#useful-docker-commands)
- [Web application features](#web-application-features)
- [API endpoints](#api-endpoints)
- [Database model](#database-model)
- [Importing restaurant and product data](#importing-restaurant-and-product-data)
- [AI food-photo analysis](#ai-food-photo-analysis)
- [Run services without Docker](#run-services-without-docker)
- [Troubleshooting](#troubleshooting)
- [Known limitations and future work](#known-limitations-and-future-work)
- [Security notes](#security-notes)

## What is implemented

- Account registration, login, and current-user endpoint using JWT authentication.
- Argon2 password hashing.
- Dietary-preference storage.
- Restaurant and dish search endpoints, including category/city filters and nearby search by coordinates.
- Interactive Leaflet map with OpenStreetMap tiles and browser geolocation in the web UI.
- Food diary endpoints for creating, editing, deleting, and listing meals, plus daily calorie/macronutrient summary.
- Recipe listing and recipe detail endpoints.
- Shopping-list endpoints and item check/uncheck support.
- JSON catalog import for restaurants, ingredients, dishes, recipes, stores, products, and store catalogue items.
- Optional OpenAI-based food-photo estimate endpoint. The estimate must be reviewed and confirmed by the user before it is saved.
- PostgreSQL schema managed by Alembic migrations.
- Docker Compose setup for PostgreSQL, API, and frontend.
- A starter guide for a future Expo/React Native mobile client.

**Data warning:** the database does not ship with a large restaurant catalogue for Łódź, nor verified Biedronka/Dino product catalogues or live prices. The example catalog is illustrative only. The map and search can return no results until real or test catalogue data is imported.

## Technology stack

| Layer | Technology |
|---|---|
| Web UI | React, TypeScript, Vite |
| Map | Leaflet, React-Leaflet, OpenStreetMap tiles |
| API | Python 3.12, FastAPI, Uvicorn |
| Validation/settings | Pydantic v2, pydantic-settings |
| ORM/database access | SQLAlchemy 2 |
| Database | PostgreSQL 16 |
| Migrations | Alembic |
| Authentication | JWT via PyJWT; Argon2 password hashing via pwdlib |
| AI integration | OpenAI API (optional) |
| Local orchestration | Docker Compose |
| Mobile starting point | Expo/React Native documentation only; no finished native app in this package |

## Architecture and request flow

```text
Browser
  └── React + TypeScript + Vite (localhost:5173)
        └── HTTP requests to FastAPI (localhost:8000)
              └── SQLAlchemy
                    └── PostgreSQL (host port 5434; container port 5432)

Optional food-photo analysis:
Browser uploads image → FastAPI validates image → OpenAI vision API
→ estimate returned for user review → confirmation endpoint saves accepted values
```

Docker Compose builds the API from `backend/` and the web UI from `frontend/`. PostgreSQL health is checked before the API starts. The API runs Alembic migrations before starting Uvicorn; the web service waits for the API health check.

## Project structure

```text
Caduceus_Complete_Project/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app, CORS, router registration, health check
│   │   ├── config.py               # Environment-based settings
│   │   ├── database.py             # SQLAlchemy engine/session and DB dependency
│   │   ├── models.py               # SQLAlchemy database models
│   │   ├── schemas.py              # Pydantic request/response schemas
│   │   ├── security.py             # Password hashing, JWT, current-user dependency
│   │   └── routers/
│   │       ├── auth.py             # Registration, login, current user
│   │       ├── profile.py          # User profile and dietary preferences
│   │       ├── restaurants.py      # Restaurant/dish search and nearby lookup
│   │       ├── nutrition.py        # Food diary and daily totals
│   │       ├── recipes.py          # Recipe listing and detail
│   │       ├── shopping.py         # Shopping lists and list items
│   │       ├── catalog.py          # JSON catalog import
│   │       └── food_scan.py        # Optional AI food-photo estimate/confirmation
│   ├── migrations/
│   │   ├── env.py
│   │   └── versions/               # Alembic schema migrations
│   ├── tests/                      # API smoke test
│   ├── Dockerfile
│   ├── requirements.txt
│   └── alembic.ini
├── frontend/
│   ├── src/
│   │   ├── App.tsx                 # Main web application and API calls
│   │   ├── main.tsx                # React entry point
│   │   └── style.css               # UI styles
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── data/
│   ├── catalog.example.json        # Example import payload
│   └── README.md                   # Catalog data format
├── mobile/
│   └── README.md                   # Future Expo/React Native client notes
├── .env.example                    # Safe template for local environment variables
├── .gitignore
├── docker-compose.yml
├── START_CADUCEUS.bat               # Windows startup helper
├── STOP_CADUCEUS.bat                # Windows stop helper
├── PROJECT_STATUS.md                # Scope and verification notes
└── README.md
```

## Run with Docker

### Prerequisites

- Docker Desktop installed and running.
- Docker Compose v2 (`docker compose`, with a space).
- Git is only needed if cloning the repository.

### 1. Get the source

If cloning from GitHub, replace the placeholder with the actual repository URL:

```bash
git clone <YOUR_REPOSITORY_URL>
cd Caduceus_Complete_Project
```

Or extract the ZIP and open a terminal in the directory containing `docker-compose.yml`.

### 2. Create `.env`

Windows CMD:

```cmd
copy .env.example .env
```

PowerShell, macOS, or Linux:

```bash
cp .env.example .env
```

For local use, the defaults can start the stack. Before sharing or deploying the project, replace the database password and `SECRET_KEY` with strong private values. Add `OPENAI_API_KEY` only if AI photo analysis is needed.

### 3. Build and start all services

```bash
docker compose up --build -d
```

Check service status:

```bash
docker compose ps
```

Wait until `db` and `api` report healthy/running before using the application. The first build can take several minutes while Docker downloads images and installs dependencies.

### 4. Open the app

- Web application: http://localhost:5173
- FastAPI base URL: http://localhost:8000
- Interactive API documentation: http://localhost:8000/docs
- API health check: http://localhost:8000/health
- PostgreSQL from the host: `localhost:5434`

The API health check should return a JSON response similar to:

```json
{"status":"ok","service":"caduceus-api"}
```

### 5. Stop the project

```bash
docker compose down
```

This stops and removes the containers/network but retains the named PostgreSQL data volume.

**Destructive reset:** `docker compose down -v` removes the PostgreSQL volume and deletes stored database data. Use it only when you deliberately want a fresh database.

## Useful Docker commands

Run/restart services:

```bash
docker compose up -d
```

Follow all logs:

```bash
docker compose logs -f
```

Follow logs for one service:

```bash
docker compose logs -f api
docker compose logs -f web
docker compose logs -f db
```

Rebuild all services without build cache:

```bash
docker compose build --no-cache
docker compose up -d
```

Rebuild only the frontend or API:

```bash
docker compose build --no-cache web
docker compose build --no-cache api
```

Check the resolved Compose configuration and service names:

```bash
docker compose config
docker compose config --services
docker compose ps -a
```

Open a PostgreSQL shell inside the database container:

```bash
docker compose exec db psql -U caduceus -d caduceus
```

## Web application features

### Explore / restaurant map

- Search restaurants by name or description.
- Filter restaurants by category.
- Search dishes and display restaurant/dish data returned by the API.
- Display restaurants with coordinates on the Leaflet map.
- Use browser geolocation to search nearby restaurants.

The default map center is Łódź. Browser geolocation requires permission and may fail if the browser cannot determine a position. The nearby search endpoint uses a radius in kilometres. Because the catalogue starts empty, import restaurant records with latitude and longitude to see useful results. The example record is not a real restaurant.

### Authentication

- Create an account.
- Log in and keep the access token in browser local storage.
- Sign out to remove the locally stored token.
- Use the token for endpoints that require authentication.

### Food diary

- Add a meal with calories, protein, fat, and carbohydrates.
- Load the current user's meals.
- View daily nutrition totals.
- API endpoints also support updating and deleting meal entries.

### Recipes and shopping lists

The backend provides recipe listing/detail and shopping-list/item APIs. The web UI includes navigation areas for these features; the degree of UI functionality may be more limited than the backend API and can be expanded in future development.

### Food-photo scan

The API has an optional OpenAI-powered analysis flow. The model's nutrition estimate is approximate and must be reviewed by the user. It should not be treated as an exact measurement or medical advice.

## API endpoints

Open Swagger at http://localhost:8000/docs for request schemas, response examples, and the **Authorize** control. Endpoints marked **Auth required** need a bearer access token.

| Method | Endpoint | Purpose | Authentication |
|---|---|---|---|
| GET | `/health` | API health check | No |
| POST | `/auth/register` | Register a user | No |
| POST | `/auth/login` | Log in and receive JWT | No |
| GET | `/auth/me` | Get current user | Yes |
| GET | `/profile` | Get current user's profile | Yes |
| GET | `/profile/preferences` | List dietary preferences | Yes |
| POST | `/profile/preferences` | Add a dietary preference | Yes |
| DELETE | `/profile/preferences/{preference_id}` | Delete a dietary preference | Yes |
| GET | `/restaurants` | Search/filter restaurants | No |
| GET | `/restaurants/nearby` | Find restaurants within a radius of coordinates | No |
| GET | `/restaurants/{restaurant_id}` | Get restaurant details | No |
| GET | `/restaurants/{restaurant_id}/dishes` | List/filter dishes at a restaurant | No |
| GET | `/dishes` | Search/filter dishes | No |
| GET | `/nutrition/meals` | List current user's meal entries | Yes |
| POST | `/nutrition/meals` | Add a meal entry | Yes |
| PATCH | `/nutrition/meals/{meal_id}` | Update a meal entry | Yes |
| DELETE | `/nutrition/meals/{meal_id}` | Delete a meal entry | Yes |
| GET | `/nutrition/summary` | Daily calorie and macro totals | Yes |
| GET | `/recipes` | List recipes | No |
| GET | `/recipes/{recipe_id}` | Recipe details | No |
| GET | `/shopping` | List user's shopping lists | Yes |
| POST | `/shopping` | Create a shopping list | Yes |
| GET | `/shopping/{list_id}/items` | List items in a shopping list | Yes |
| POST | `/shopping/{list_id}/items` | Add a shopping-list item | Yes |
| PATCH | `/shopping/{list_id}/items/{item_id}/check` | Mark an item checked/unchecked | Yes |
| POST | `/catalog/import-json` | Import catalogue JSON | Yes |
| POST | `/food-scan/analyze` | Analyze an uploaded food photo | Yes; OpenAI key required |
| POST | `/food-scan/{scan_id}/confirm` | Confirm/correct the scan estimate | Yes |

### Example search requests

Search restaurants in the default city:

```text
GET http://localhost:8000/restaurants
```

Search by name/description:

```text
GET http://localhost:8000/restaurants?q=Demo
```

Search nearby (example coordinates around central Łódź, radius 10 km):

```text
GET http://localhost:8000/restaurants/nearby?latitude=51.759&longitude=19.456&radius_km=10
```

Search dishes:

```text
GET http://localhost:8000/dishes?q=chicken
```

## Database model

The initial Alembic migration creates the project's core relational schema. The main model groups are:

- **Users and preferences:** users and their dietary preferences.
- **Restaurants and dishes:** restaurants, dishes, ingredients, and dish-to-ingredient links.
- **Recipes:** recipes and recipe ingredients.
- **Stores and products:** stores, products, and store catalogue entries with price/availability fields.
- **Food diary:** meal entries linked to the user.
- **Shopping:** shopping lists and their items.
- **Food scan:** uploaded-photo scan sessions and their analysis/confirmation state.

Alembic migrations are stored in `backend/migrations/versions/`. The API container runs `alembic upgrade head` before launching FastAPI. If you change models, create a new migration rather than manually changing a deployed database schema.

## Importing restaurant and product data

The initial database has schema but no populated restaurant/product catalogue. Example data structure is in `data/catalog.example.json`, and import notes are in `data/README.md`.

The authenticated endpoint is `POST /catalog/import-json`.

General workflow:

1. Register and log in through Swagger.
2. Click **Authorize** and enter the access token as required by the Swagger dialog.
3. Open `POST /catalog/import-json`.
4. Submit a small JSON payload based on `data/catalog.example.json`.
5. Verify the imported records using `GET /restaurants`, `GET /dishes`, and the map.

The JSON supports optional arrays for `restaurants`, `ingredients`, `dishes`, `recipes`, `stores`, `products`, and `store_catalog_items`. Use unique stable `code` values to identify records consistently. See `data/README.md` for the supported fields.

Do not treat example prices or nutrition values as real-world facts. Real restaurant menus, store products, and prices need a reliable data source and verification.

## AI food-photo analysis

AI photo analysis is optional. Without an OpenAI API key, the rest of the application should still run.

1. Set `OPENAI_API_KEY` in the local `.env` file.
2. Keep the key on the backend only; never expose it in frontend source code or commit it to GitHub.
3. Restart/rebuild the API:

```bash
docker compose up --build -d api
```

4. Use `POST /food-scan/analyze` with multipart form field `image`.
5. Review the returned estimate, then submit user-approved/corrected values to `POST /food-scan/{scan_id}/confirm`.

The endpoint accepts JPEG, PNG, and WebP images, with a maximum upload size of 8 MB. Model estimates may be inaccurate and should be treated as estimates only.

## Run services without Docker

Docker Compose is the recommended local setup. Running services directly requires Python 3.12, Node/npm, and a reachable PostgreSQL instance.

### Backend (Windows CMD)

Start PostgreSQL separately and ensure it is reachable. From the project root:

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

If running the backend outside Compose, use the database host/port appropriate to your PostgreSQL setup. The `db` hostname only works for services on the Compose network; from the host, use `localhost:5434` with the default port mapping.

### Frontend

In a separate terminal:

```cmd
cd frontend
npm install
npm run dev
```

Set `VITE_API_URL` to the API URL if it is not `http://localhost:8000`. Vite normally serves the UI at http://localhost:5173.

## Troubleshooting

### Frontend shows no restaurants

- The database is intentionally empty at first.
- Import a small catalog JSON through `POST /catalog/import-json`.
- Ensure restaurant records have `is_active: true`, a city matching the query, and coordinates for map markers.
- Test the API directly at `http://localhost:8000/restaurants?q=Demo`.

### `Timeout expired` when using “Near me”

The browser's geolocation request can time out or be denied. Allow location access in the browser and try again. This is separate from text search. Text search should be tested with the Search control or by requesting `/restaurants?q=...` directly.

### A service exited

```bash
docker compose ps -a
docker compose logs --tail=100 web
docker compose logs --tail=100 api
docker compose logs --tail=100 db
```

Read the first meaningful error in the service logs. `Exited (137)` means the process was forcibly killed; memory pressure is one possible cause, but inspect logs and Docker Desktop resource usage before assuming.

### Rebuild after changing source/dependencies

```bash
docker compose build --no-cache web
docker compose build --no-cache api
docker compose up -d
```

Do not remove the database volume to fix an image-build error. The volume is separate from the source code and build cache.

## Known limitations and future work

This package is a development starter, not a complete production deployment. Not included or not yet finished:

- A verified bulk restaurant catalogue for Łódź.
- Verified Biedronka/Dino product data and live prices.
- A fully implemented native Expo/React Native app (only a starter guide is included).
- A fully developed frontend workflow for every backend endpoint; some functionality is API-first.
- pgvector/RAG, Redis/Celery background jobs, webhooks, payments, production hosting, HTTPS, backups, rate limiting, and monitoring.
- A production-grade test suite and full CI/CD pipeline.

Before production use, add comprehensive tests, secure secrets, configure HTTPS, review authentication/session handling, implement backup/monitoring and rate limits, and verify privacy requirements for uploaded food photos.

## Security notes

- Do not commit `.env`, passwords, JWT secrets, or API keys.
- Commit `.env.example` only when it contains placeholders, not real credentials.
- Replace development credentials before deployment.
- Food-photo analysis uploads data to the configured OpenAI API when enabled; do not upload images without considering consent and privacy.
- Nutrition estimates are informational, not medical advice.

## License

No license is included by default. Add a `LICENSE` file before allowing others to reuse, modify, or distribute the project.
