# Caduceus Mobile — Expo / React Native starter

This folder is a preparation guide, not a complete built mobile app yet. The recommended approach is to create the Expo app here and use the same FastAPI backend as the web client.

## Create the app
From the repository root:
```bash
cd mobile
npx create-expo-app@latest . --template blank-typescript
npx expo install expo-location expo-image-picker
npx expo start
```
If the folder already contains generated Expo files, do not run the create command over them.

## API base URL
- Android emulator: `http://10.0.2.2:8000`
- iOS simulator: `http://localhost:8000`
- Physical phone: `http://YOUR_COMPUTER_LAN_IP:8000` (phone and PC on the same Wi-Fi)
- HTTPS is recommended for deployed builds.

## Planned scan flow
1. Use `expo-image-picker` to take a photo.
2. Show the photo and allow the user to retake it.
3. Upload the image to a future authenticated `POST /food-scan/analyze` endpoint.
4. Backend calls the configured vision model, returns proposed dish/ingredients/portion/macros.
5. User reviews and edits the estimate.
6. Confirmed result is saved to `food_scan_sessions` and `meal_entries`.

No AI scan endpoint or API key is included yet. Keep provider API keys on the backend, never in the mobile app.
