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

## Deploy to Azure Static Web Apps

Pushing to `main` runs `.github/workflows/azure-static-web-apps-icy-mushroom-0a05ca203.yml`. It builds the static site with `npm run build:static` and uploads `dist/`.

Static Web Apps can't run the Express API, so the static site works differently from the Docker version:

- Hikes and tours are bundled from `server/data/`.
- The calendar shows each walk's scheduled days, but can't see existing bookings.
- Booking requests open a pre-filled email to the address in `src/data/contact.js`.

To try the static site locally:

```sh
npm run build:static
npx vite preview
```

## Verify

```sh
npm test
docker compose up --build
```
