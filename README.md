# CTA Bus Tracker

MVP project containing a TypeScript API and an Expo / React Native mobile app. The backend keeps the CTA API key private and proxies route, direction, stop, and prediction requests to the mobile client.

## Setup

1. Install Node.js 22.13 or newer (required by the current Expo SDK).
2. Run `npm install`.
3. Copy `.env.example` to `.env` and set `CTA_API_KEY`.
4. Start the development server with `npm run dev`.

The key belongs only in the backend `.env` file. Do not add it to the mobile application or commit `.env`.

## API endpoints

- `GET /health`
- `GET /api/routes`
- `GET /api/routes/:routeId/directions`
- `GET /api/stops?stopId=1234`
- `GET /api/stops?routeId=20&direction=Eastbound`
- `GET /api/stops/:stopId/predictions?routeId=20`

Route stop lists require both a route and a direction. For direct Stop ID lookup, pass `stopId`. Free-text stop-name search is not supported by the CTA endpoints used in this MVP.

The optional `CTA_DATA_FEED` setting is for multi-feed API accounts. Confirm whether your account needs it with CTA before setting it. No prediction caching is included in this MVP.

## Run API tests

Run `npm test` to execute the HTTP route tests. The tests mock CTA responses, so they do not require a real API key or make network calls to CTA.

## Mobile app

See [mobile/README.md](mobile/README.md) for device-specific backend URLs. To start the app, configure `mobile/.env` from `mobile/.env.example`, then run `npm start` from `mobile/`.
