# Stellies Hikes and Tours — Base44 Dev Notes

## What this project is
A static single-page marketing site for "Stellies Hikes and Tours" (guided hikes in the Boland, South Africa). No backend, no database, no build step.

## Architecture
- **`Stellies Hikes and Tours.dc.html`** — the main page. Uses a custom "dc" template runtime (custom elements like `<x-dc>`, `<sc-if>`, `<sc-for>`, `<image-slot>`).
- **`support.js`** — the dc-runtime. At runtime it loads React 18.3.1, ReactDOM 18.3.1, and Babel standalone from unpkg.com CDN, then parses the `<x-dc>` template and renders it with React.
- **`image-slot.js`** — user-fillable image placeholder component used throughout the page.
- **`_ds/organic-5919bafb-.../`** — the "Organic" design system: `styles.css` (CSS variables/tokens, component classes, Google Fonts import), `_ds_bundle.js` (namespace setup), `_ds_manifest.json` (token definitions).
- **`index.html`** — a redirect stub that forwards `/` to the dc.html page (needed because the main file has spaces in its name).

## How it runs
- Served by `python -m http.server` inside a `python:3.12-slim` container (docker-compose.base44.yml).
- Host port 3000 → container port 8000.
- Source is bind-mounted read-only at `/app`.
- No live reload — edits require `reload_preview` to reflect in the preview.

## External dependencies (runtime, via CDN)
- React 18.3.1, ReactDOM 18.3.1, Babel standalone — all from unpkg.com (no local copies).
- Google Fonts (Caprasimo, Figtree) — via `@import` in styles.css.

## Secrets
None required. The app is fully static with no external service credentials.

## Verification
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` → 200
- `curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/Stellies%20Hikes%20and%20Tours.dc.html"` → 200
- All JS/CSS assets return 200.
- The page renders via client-side React after loading CDN scripts.
