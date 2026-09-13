import express from 'express';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { checkBookingConflict, generateAvailability } from './availability.js';

// The booking logic lives in ./availability.js so the static site build can reuse it in the browser.
// Re-exported here so tests and other callers can keep importing it from the server.
export { businessDateParts, checkBookingConflict, generateAvailability, getAvailableSlotsForDate } from './availability.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
// DATA_DIR lets tests point the JSON "database" at a temporary copy instead of server/data.
const DATA_DIR = process.env.DATA_DIR || join(__dirname, 'data');
const DIST_DIR = join(__dirname, '..', 'dist');
const INDEX_HTML = join(DIST_DIR, 'index.html');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

function loadJson(file, fallback) {
  const p = join(DATA_DIR, file);
  if (!existsSync(p)) return fallback;
  return JSON.parse(readFileSync(p, 'utf-8'));
}

function saveJson(file, data) {
  writeFileSync(join(DATA_DIR, file), JSON.stringify(data, null, 2));
}

const hikes = loadJson('hikes.json', []);
const tours = loadJson('tours.json', []);
let bookings = loadJson('bookings.json', []);

const app = express();
app.use(express.json());

// CORS for dev
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// --- Hikes ---
app.get('/api/hikes', (req, res) => res.json(hikes));
app.get('/api/hikes/:id', (req, res) => {
  const h = hikes.find(t => t.id === req.params.id);
  if (!h) return res.status(404).json({ error: 'Hike not found' });
  res.json(h);
});

// --- Tours ---
app.get('/api/tours', (req, res) => res.json(tours));
app.get('/api/tours/:id', (req, res) => {
  const t = tours.find(t => t.id === req.params.id);
  if (!t) return res.status(404).json({ error: 'Tour not found' });
  res.json(t);
});

// --- Availability (cal.diy-inspired) ---
// Generates available dates for the next 30 days based on the item's schedule
app.get('/api/availability/:type/:id', (req, res) => {
  const { type, id } = req.params;
  const item = type === 'hike' ? hikes.find(h => h.id === id) : tours.find(t => t.id === id);
  if (!item) return res.status(404).json({ error: 'Not found' });

  const dates = generateAvailability(item, bookings);
  res.json({ dates });
});

// --- Bookings ---
app.get('/api/bookings', (req, res) => res.json(bookings));

app.post('/api/bookings', (req, res) => {
  const { type, itemId, date, time, name, email, phone, people, notes } = req.body;
  if (!type || !itemId || !date || !time || !name || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const item = type === 'hike' ? hikes.find(h => h.id === itemId) : tours.find(t => t.id === itemId);
  if (!item) return res.status(404).json({ error: 'Hike/tour not found' });

  if (checkBookingConflict(bookings, { itemId, date, time })) {
    return res.status(409).json({ error: 'That slot is already booked' });
  }

  const booking = {
    id: 'bk-' + Date.now().toString(36),
    type, itemId, itemName: item.name,
    date, time, name, email, phone: phone || '',
    people: parseInt(people) || 1, notes: notes || '',
    price: item.price * (parseInt(people) || 1),
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
  bookings.push(booking);
  saveJson('bookings.json', bookings);
  res.status(201).json(booking);
});

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

if (existsSync(INDEX_HTML)) {
  app.use(express.static(DIST_DIR));

  app.get('*', (req, res) => {
    res.sendFile(INDEX_HTML);
  });
}

export { app };

export function startServer(port = process.env.PORT || 3001, host = process.env.HOST || '0.0.0.0') {
  return app.listen(port, host, () => console.log(`Server on http://${host}:${port}`));
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
