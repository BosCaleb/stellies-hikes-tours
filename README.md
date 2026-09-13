# Stellies Hikes and Tours

Local Docker deployment for the Stellies Hikes and Tours React/Vite app with its Express JSON API.

## Run With Docker

```sh
docker compose up --build
```

Open http://localhost:3000.

The container builds the Vite frontend, serves it from Express, and exposes the API under `/api`.
Bookings are written to `server/data/bookings.json` through the compose volume.

## Local Development

```sh
npm install
npm run dev
```

Vite runs on http://localhost:5173 and proxies `/api` to the Express API on port 3001.

## Verify

```sh
npm test
docker compose up --build
```
