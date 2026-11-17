# Caduceus Mobile

A cross-platform nutrition assistant application built with **React Native, Expo and TypeScript**.

Caduceus helps users explore nutrition information, manage dietary preferences, discover recipes and follow cooking instructions through a mobile interface.

## Technologies

- React Native
- Expo SDK 58
- TypeScript
- React Navigation 7
- Expo Camera
- Expo Image Picker
- Expo Location
- React Native Maps
- Clash Display typography

## Features and screens

### Onboarding and preferences
- Welcome screen
- User registration interface
- Dietary preferences
- Food limitations

### Nutrition tracking
- Dashboard
- Camera interface and photo capture
- Manual ingredient entry
- Macronutrient summary

### Recipes and cooking
- Restaurant and recipe discovery
- Restaurant menu
- Dish details
- Step-by-step cooking instructions

### Ingredient shopping
- Ingredient store information
- Store options and map interface

### Settings and personalization
- Settings dashboard
- Security and privacy
- Personal information
- Daily nutrition and water goals
- Dietary preference settings

## Project structure

```text
mobile/
├── assets/
│   ├── fonts/
│   └── images/
├── src/
│   ├── components/
│   ├── navigation/
│   ├── screens/
│   └── types/
├── App.tsx
├── package.json
└── README.md
```

## Getting started

### Requirements

- Node.js and npm
- Expo Go on a compatible mobile device, or an appropriate development build

### Installation

From the repository root:

```bash
cd mobile
npm install
```

### Start the application

```bash
npx expo start
```

Scan the QR code using Expo Go.

If your local network connection does not work:

```bash
npx expo start --tunnel
```

## Navigation

The application uses React Navigation with a typed native stack navigator.

The main navigation connects the dashboard, camera, recipe discovery, dietary preferences and settings sections. Individual screens also provide bottom navigation for moving between application areas.

## Design

The application uses a consistent visual design based on:

- Clash Display custom fonts.
- Blue primary interface elements.
- Warm off-white backgrounds.
- Pale yellow decorative elements.
- Custom illustrations and image assets.
- Reusable interface components.

## Backend integration

The mobile application is part of the larger Caduceus project and is intended to communicate with its FastAPI backend.

The planned food scanning workflow is:

1. Capture a food image.
2. Preview the image.
3. Upload the image to the backend.
4. Receive proposed food and nutrition information.
5. Allow the user to review and correct the result.
6. Save confirmed information to the user's nutrition history.

Provider API keys must remain on the backend and must never be stored in the mobile application.

## Implementation status

The current mobile application contains the main frontend screens and navigation flows.

Some functionality is still under development:

- Backend authentication and registration.
- Persistent user preferences and daily goals.
- Actual nutrition calculations from ingredient quantities.
- Complete AI-powered food recognition.
- Persistent recipe saving.
- Live store and product catalogue integration.

Nutrition summaries currently use preview data and should not be treated as actual nutritional analysis.

## Development

Check TypeScript:

```bash
npx tsc --noEmit
```

Start Expo:

```bash
npx expo start
```

Build and test the application before committing changes.
