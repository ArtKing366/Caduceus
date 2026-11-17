# Caduceus — Intelligent Nutrition Assistant

Caduceus is a standalone full-stack nutrition assistant project. It includes a web application, a native mobile application, a backend API and a PostgreSQL database.

## Project structure

```text
Caduceus/
├── backend/          # Python FastAPI backend
├── frontend/         # React + TypeScript web application
├── mobile/            # Expo + React Native mobile application
├── data/              # Example catalogue data
├── docker-compose.yml
├── .env.example
└── README.md
```

## Technologies

- **Web:** React, TypeScript, Vite, Leaflet and OpenStreetMap.
- **Mobile:** React Native, Expo SDK 58 and TypeScript.
- **Navigation:** React Navigation native stack.
- **API:** Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2, JWT authentication and Argon2 password hashing.
- **Database:** PostgreSQL 16 with Alembic migrations.
- **Mobile device features:** Expo Camera, Expo Font, Expo Image Picker and Expo Location.

## Mobile application

The native mobile application is located in `mobile/`. It is built with Expo, React Native and TypeScript, with React Navigation used for screen-based navigation.

### Running the mobile application

Requirements:
- Node.js and npm.
- Expo Go on your mobile device, or an appropriate development build.

Open a terminal in the project root and run:

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code using Expo Go.

If the local network connection does not work, try:

```bash
npx expo start --tunnel
```

### Mobile application screens and navigation

The mobile application includes the following screens and user flows:

**Onboarding and preferences**
- Welcome
- Registration
- Dietary Preferences
- Limitations

**Nutrition tracking**
- Dashboard
- Camera
- Ingredient Entry
- Macro Summary

**Recipes and cooking**
- Restaurant Search
- Restaurant Menu
- Dish Details
- Cooking Instructions

**Ingredient shopping**
- Ingredient Stores
- Store Options

**Settings and account preferences**
- Settings
- Security & Privacy
- Personal Information
- Daily Goals
- Preference Settings

The screens are connected through a typed React Navigation stack. Bottom navigation provides access to the main application sections.

### Mobile source code

| Location | Responsibility |
|---|---|
| `mobile/App.tsx` | Loads custom fonts and initializes the application. |
| `mobile/src/navigation/AppNavigator.tsx` | Registers application screens and navigation routes. |
| `mobile/src/screens/` | Contains the individual application screens. |
| `mobile/src/components/` | Reusable interface components. |
| `mobile/src/types/` | TypeScript types for navigation and nutrition data. |
| `mobile/assets/fonts/` | Clash Display font files. |
| `mobile/assets/images/` | Illustrations, icons and application images. |

### Reusable components

- `PrimaryButton` — general-purpose primary button.
- `OffsetButton` — button with a decorative offset background.
- `SaveRecipeButton` — recipe-saving interface.
- `PreferenceContinueButton` — button used in dietary preference selection.
- `PreferencePill` — selectable dietary preference.
- `PreferenceToggle` — preference selection control.
- `PasswordInput` — password input component.
- `IngredientInput` — ingredient entry field.

### Current mobile implementation status

Implemented:
- Expo and React Native project setup.
- Custom Clash Display typography.
- Onboarding and registration interfaces.
- Dietary preferences and limitations screens.
- Dashboard interface and bottom navigation.
- Camera permission handling, photo capture and preview.
- Manual ingredient entry interface.
- Macro summary interface.
- Recipe discovery and menu interfaces.
- Dish details and cooking instructions.
- Ingredient store and store selection interfaces.
- Settings, security and personal information screens.
- Daily goals interface.
- Typed navigation between application screens.

**Current limitations:**

The mobile application is currently a frontend prototype. Several interfaces are implemented, but not all features are connected to backend services or persistent storage.

- Macro values are currently preview/sample data rather than results from a complete nutrition calculation.
- Food recognition is not yet connected to a complete AI analysis workflow.
- Account information and daily goals are not yet saved to a backend.
- Recipe saving and user preference synchronization are not yet persistent.
- Store and product information requires verified catalogue data and integration.



### Running the mobile application

Requirements:
- Node.js and npm.
- Expo Go on your mobile device, or an appropriate development build.

Open a terminal in the project root and run:

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code using Expo Go.

If the local network connection does not work, try:

```bash
npx expo start --tunnel
```

### Mobile application flow

The current application flow is:

1. **Welcome** — introductory screen and entry point.
2. **Registration** — username and password interface with local validation.
3. **Preferences** — selection of dietary preferences.
4. **Dashboard** — nutrition overview, water information and recent activity.
5. **Camera** — camera permission handling, photo capture and preview.
6. **Ingredient Entry** — manual recipe and ingredient input.
7. **Macro Summary** — overview of calories and macronutrients.

### Mobile source code

| Location | Responsibility |
|---|---|
| `mobile/App.tsx` | Loads custom fonts and initializes navigation. |
| `mobile/src/navigation/AppNavigator.tsx` | Registers application screens and navigation flow. |
| `mobile/src/screens/` | Contains the application's individual screens. |
| `mobile/src/components/` | Reusable buttons, inputs and preference components. |
| `mobile/src/types/` | TypeScript types for navigation and nutrition data. |
| `mobile/assets/fonts/` | Clash Display font files. |
| `mobile/assets/images/` | Illustrations, icons and application images. |

### Reusable components

- `PrimaryButton` — general-purpose primary button.
- `OffsetButton` — button with a decorative offset background.
- `SaveRecipeButton` — recipe-saving button with a pressed state.
- `PreferenceContinueButton` — button used on the dietary preferences screen.
- `PreferencePill` — selectable dietary preference.
- `PasswordInput` — password input with validation styling.
- `IngredientInput` — ingredient entry field.

### Current mobile implementation status

Implemented:
- Expo and React Native project setup.
- Custom Clash Display fonts.
- Welcome and registration screens.
- Dietary preference selection.
- Dashboard interface.
- Camera permission handling and photo capture.
- Manual recipe and ingredient entry interface.
- Macro summary interface.
- Reusable UI components.
- Typed navigation.

Still to integrate:
- Backend authentication and registration.
- Persistent user dietary preferences.
- Actual nutrition calculations based on ingredient quantities.
- Image-based food recognition.
- Persistent recipe storage and synchronization with the backend.

**Important:** The current Macro Summary uses sample nutrition values for preview purposes. It does not yet calculate real nutrition from the entered ingredients. Recipe saving is also not yet connected to persistent storage.

## Web application

The web application is located in `frontend/`.

It uses React, TypeScript and Vite, with a responsive interface, Leaflet/OpenStreetMap integration and browser geolocation.

For frontend-only development:

```bash
cd frontend
npm install
npm run dev
```

Use `VITE_API_URL` to configure the API address.

## Backend API

The API is located in `backend/` and uses:

- Python 3.12.
- FastAPI and Pydantic v2.
- SQLAlchemy 2.
- JWT authentication.
- Argon2 password hashing.
- Alembic database migrations.

API documentation is available at `/docs` when the backend is running.

## Database

The project uses PostgreSQL 16.

The initial migration creates 15 core tables covering:

- Users and dietary preferences.
- Restaurants and dishes.
- Ingredients and dish ingredients.
- Recipes and recipe ingredients.
- Stores, products and catalogue prices.
- Meal diary.
- Shopping lists and shopping list items.
- Food-photo scan sessions.

The database starts with its schema rather than a fabricated bulk catalogue.

## Running the full project on Windows

Requirements: Docker Desktop running and Docker Compose v2.

1. Open a terminal in the project root.
2. Create the local environment file:

```cmd
copy .env.example .env
```

3. Start the application:

```cmd
docker compose up --build
```

The first build may take several minutes.

Available services:

- Web UI: http://localhost:5173
- API documentation: http://localhost:8000/docs
- API health: http://localhost:8000/health
- PostgreSQL: localhost:5434

Compose starts PostgreSQL, applies Alembic migrations, starts FastAPI and then starts the web application.

## AI food photo scan

The backend supports optional OpenAI vision integration.

To enable it, configure `OPENAI_API_KEY` in `.env`. The key must remain on the backend and must never be placed in frontend or mobile source code.

The authenticated endpoint is:

`POST /food-scan/analyze`

The user should review and correct estimates before confirming them through:

`POST /food-scan/{scan_id}/confirm`

Accepted image types: JPEG, PNG and WebP. Maximum image size: 8 MB.

Nutrition estimates are not medical advice or exact measurements.

## Data catalogue

See `data/README.md` for catalogue import instructions.

The project does not include fabricated restaurant data for Łódź or unverified store prices. Catalogue data should come from reliable sources and should not be presented as live pricing without verification.

## Data persistence and reset

- `docker compose down` stops containers but preserves the PostgreSQL volume.
- `docker compose down -v` deletes the database volume and its data.
- `docker compose logs -f api` displays API logs.
- `docker compose logs -f web` displays web application logs.
- `docker compose logs -f db` displays database logs.

Do not delete the PostgreSQL volume simply to rebuild application images.

## Future development

Potential next stages include:

- Connecting mobile registration and authentication to the backend.
- Real nutrition calculation using ingredient data.
- AI-powered food recognition.
- Recipe storage and meal diary synchronization.
- Persistent user preferences.
- Verified restaurant and grocery catalogues.
- Production deployment, HTTPS, backups and monitoring.

The web, mobile and backend applications are separate parts of the same Caduceus project.