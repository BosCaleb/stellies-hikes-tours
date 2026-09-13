# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Booking site for "Stellies Hikes and Tours" (guided hikes/tours around Stellenbosch). React + Vite frontend, one embedded Vue component, Express API, JSON files as the database.

## Commands

```sh
npm install
npm run dev          # Express API on :3001 + Vite on :5173 (proxies /api -> :3001)
npm run server       # API only
npm run build        # Vite build -> dist/ (talks to the Express API)
npm run build:static # static site for Azure Static Web Apps (no API; see Deployment)
npm start            # node server/index.js (also serves dist/ if it exists)
npm test             # vitest run (all tests)
npx vitest run server/index.test.js          # single file
npx vitest run -t "detects a conflicting"    # single test by name
docker compose up --build                    # production image on http://localhost:3000
```

No linter is configured. Requires Node 22+: `package.json` has no `"type"`, and `server/index.js` (ESM) relies on Node's module syntax detection.

## Deployment

There are two production targets:

- **Azure Static Web Apps.** `.github/workflows/azure-static-web-apps-*.yml` deploys on every push to `main` and creates preview environments for pull requests. Static Web Apps can't run the Express API, so the workflow runs `npm run build:static` (Vite `--mode static`) and uploads `dist/`. In that mode `STATIC_SITE` in `src/api.js` is true:
  - hikes and tours are bundled from `server/data/*.json`;
  - calendar availability is computed in the browser with `server/availability.js`, from each schedule only, since it can't see existing bookings;
  - `BookingPage` opens a pre-filled email to `CONTACT.email` (`src/data/contact.js`) instead of POSTing a booking.

  `public/staticwebapp.config.json` rewrites unknown paths to `index.html` so deep links work.
- **Docker** (`Dockerfile`, `docker compose up --build`) runs the full app, with the Express API and JSON-file bookings.

The pure booking functions live in `server/availability.js` and are re-exported from `server/index.js`. The browser bundle imports that file, so keep it free of Node-only imports.

## Architecture

**Request flow:** React components -> `src/api.js` (the only place that calls `fetch`) -> `/api/*` -> `server/index.js` -> `server/data/{hikes,tours,bookings}.json`.

**Server (`server/index.js`)** is the entire backend:
- The JSON files are loaded once at module import and kept in memory. `bookings.json` is rewritten in full on every POST. Hand-edits to the data files need a server restart.
- Booking logic is exported as pure functions (`checkBookingConflict`, `getAvailableSlotsForDate`, `generateAvailability`) so tests can call them without HTTP. Keep new logic in that shape.
- Double-booking prevention: a confirmed booking with the same `itemId` + `date` + `time` blocks the slot (409). Any change to booking or availability logic must preserve this.
- Availability covers the next 30 days (starting tomorrow). It is filtered by each item's `daysOfWeek` (JS `getDay()`, 0 = Sunday), with `timeSlots` defaulting to `['08:00','10:00']`. Booked slots are removed.
- `/api` requests that match no route return a JSON 404. If `dist/index.html` exists, the server also serves the built SPA with a catch-all fallback. This is how a single process serves everything in Docker on port 3000 (`PORT`/`HOST` env vars).
- The server does not listen when `NODE_ENV === 'test'`, so tests can import the module.

**Frontend (`src/`):** routes live in `src/App.jsx` (react-router-dom v6). Components are plain functional components styled with plain CSS in `src/styles.css`: design tokens (`--color-*`, `--font-*`, `--radius-*`) sit in `:root`, and components use BEM-style classes (`experience-card__media`, `site-nav__link`) rather than inline styles. There is no Tailwind, component library or icon package; `src/components/Icon.jsx` holds inline SVG paths. `/hikes` and `/tours` are thin wrappers around `ExperienceBrowser.jsx`, which keeps its area and difficulty filters in the URL (`?area=Paarl&difficulty=Easy`) so the home page and footer can link straight to a filtered list. The area cards come from `src/data/regions.js`.

**Photos:** the mountain photos are Creative Commons images from Wikimedia Commons, stored in `public/images/mountains/` and referenced by path from the `image`/`imageAlt` fields in `server/data/*.json`. Their licences require attribution, so every photo needs an entry in `src/data/imageCredits.json`, which the `/credits` page renders.

**Vue island:** `src/vue/BookingCalendar.vue` is deliberately the one Vue 3 SFC. It is mounted into React by `src/components/VueCalendar.jsx` via `createApp`. It receives an `availability` prop (`{ dates: { 'YYYY-MM-DD': [times] } }`) and emits `selected` with `{ date, time }`, which the wrapper forwards to the `onSelected` callback. The wrapper re-mounts the Vue app whenever `availability` changes, which resets the selection. Don't rewrite it in React unless asked. It takes its colours from the site's `--color-accent*`, `--color-neutral-*`, `--color-bg` and `--font-*` tokens, so keep those names when changing the palette.

**Tests:** Vitest is configured inside `vite.config.js` (`jsdom` environment, `globals: true`, setup in `vitest.setup.js` for jest-dom). The same config pins `TZ=Africa/Johannesburg`, so date bugs that only appear east of UTC also fail on UTC machines. Server tests are in `server/index.test.js`. React tests sit next to their components (`src/App.test.jsx`, which uses `MemoryRouter`). `src/vue/BookingCalendar.test.js` mounts the Vue calendar with `createApp` and fakes only `Date`.

## Gotchas

- The server reads its JSON files from `process.env.DATA_DIR`, falling back to `server/data`. `server/index.test.js` sets `DATA_DIR` to a temporary copy before importing `./index.js`, so tests never touch the real `bookings.json`, which Docker compose bind-mounts. New server tests must keep importing `./index.js` dynamically (after `DATA_DIR` is set), because the data is loaded at import time.
- **Availability dates are South African calendar dates.** `generateAvailability` works out today's date in `Africa/Johannesburg` with `Intl`, whatever timezone the server runs in (the Docker container is UTC). It then steps through UTC midnights so `getUTCDay()` and `toISOString()` agree on the day. `BookingCalendar.vue` builds its `YYYY-MM-DD` keys from each cell's year, month and day. Never build a date key with `toISOString()` on a local-midnight `Date`: east of UTC it lands on the previous day, which is how bookings used to be saved a day early.
- **Legacy duplicate stack:** `server.js` (a raw `http` server on :3000) + `public/` (a React UMD + Babel-in-browser `app.jsx` and a template-string `vue-calendar.js`). It is only used by `docker-compose.base44.yml` / `.base44/environment.json` for the Base44 preview. It duplicates the API and booking logic, so changes to `server/index.js` are not reflected there. Also, `public/` is Vite's default `publicDir`, so its files get copied into `dist/` on build.
- `AGENTS.md` and `.github/agents/test-writer.agent.md` are out of date: they say no tests exist, and the second half of `AGENTS.md` describes a `.dc.html` static site that isn't in this repo. Trust the code over them.
- `.gitignore` must stay tracked. It used to list itself, so it was never committed, and the Base44 environment committed a Linux-only `node_modules/` that broke `vite` and `vitest` on Windows. It now ignores `node_modules/` and `dist/`; install dependencies per machine with `npm ci`.
