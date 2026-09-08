import express from 'express';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, 'data');

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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dates = {};
  for (let i = 1; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dow = d.getDay(); // 0=Sun
    if (item.daysOfWeek && !item.daysOfWeek.includes(dow)) continue;
    const key = d.toISOString().slice(0, 10);
    // Check existing bookings to reduce slot capacity
    const bookedSlots = bookings
      .filter(b => b.itemId === id && b.date === key && b.status === 'confirmed')
      .map(b => b.time);
    const slots = (item.timeSlots || ['08:00', '10:00']).filter(
      s => !bookedSlots.includes(s)
    );
    if (slots.length > 0) dates[key] = slots;
  }
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

  // Check slot availability
  const existing = bookings.filter(
    b => b.itemId === itemId && b.date === date && b.time === time && b.status === 'confirmed'
  );
  if (existing.length > 0) {
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

const PORT = 3001;
app.listen(PORT, () => console.log(`API server on http://localhost:${PORT}`));
