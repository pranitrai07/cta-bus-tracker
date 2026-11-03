# CTA Bus Tracker mobile app

Expo + React Native + TypeScript app for the CTA Bus Tracker MVP.

## Run locally

1. Start the backend from the repository root with `npm run dev`.
2. Copy this folder's `.env.example` to `.env` and set `EXPO_PUBLIC_API_BASE_URL` for your device:
   - iOS simulator: `http://127.0.0.1:3000/api`
   - Android emulator: `http://10.0.2.2:3000/api`
   - Physical phone: `http://<computer-LAN-IP>:3000/api`
3. From this folder, run `npm start`, then open the project in Expo Go or a development build.

Expo public environment variables are embedded in the client bundle. This app uses one only for the backend URL; never put the CTA API key in a mobile environment variable. Keep the key in the backend's `.env` file.

The app flow is route search → direction → stop → arrivals. The API returns route lists and per-direction stop lists; free-text search is over route number/name because the CTA API does not expose a full text search of all stop names.
