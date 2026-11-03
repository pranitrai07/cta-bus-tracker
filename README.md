# CTA Bus Tracker API

Minimal TypeScript backend for the CTA Bus Tracker MVP. The backend keeps the CTA API key private and proxies the route, direction, stop, and prediction requests needed by the mobile app.

## Setup

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and set `CTA_API_KEY`.
4. Start the development server with `npm run dev`.

The key belongs only in the backend `.env` file. Do not add it to the mobile application or commit `.env`.

## Endpoints

- `GET /health`
- `GET /api/routes`
- `GET /api/routes/:routeId/directions`
- `GET /api/stops?stopId=1234`
- `GET /api/stops?routeId=20&direction=Eastbound`
- `GET /api/stops/:stopId/predictions?routeId=20`

Route stop lists require both a route and a direction. For direct Stop ID lookup, pass `stopId`. Free-text stop-name search is not supported by the CTA endpoints used in this MVP.

The optional `CTA_DATA_FEED` setting is for multi-feed API accounts. Confirm whether your account needs it with CTA before setting it. No prediction caching is included in this MVP.
