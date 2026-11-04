# CTA Bus Tracker mobile app

Expo + React Native + TypeScript app for the CTA Bus Tracker MVP.

## Run locally

1. Start the backend from the repository root with `npm run dev`.
2. From this folder, run `npm start`. The launcher detects the Mac's current private Wi-Fi IPv4 address and uses `http://<detected-address>:3000/api` automatically. Use the same Wi-Fi network on your phone and Mac.
3. Open the project in Expo Go or a development build. Use `npm run ios`, `npm run android`, or `npm run web` when you want to select a platform; these commands also detect the address automatically.

To use a fixed backend address, set `EXPO_PUBLIC_API_BASE_URL` in the shell before starting Expo. That explicit value takes precedence over automatic detection. You can also use the usual `127.0.0.1` (iOS simulator) or `10.0.2.2` (Android emulator) address this way.

Expo public environment variables are embedded in the client bundle. This app uses one only for the backend URL; never put the CTA API key in a mobile environment variable. Keep the key in the backend's `.env` file.

The app flow is route search → direction → stop → arrivals. The API returns route lists and per-direction stop lists; free-text search is over route number/name because the CTA API does not expose a full text search of all stop names.
