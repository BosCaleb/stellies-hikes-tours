const http = require('http');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'server', 'data');
const PUBLIC_DIR = path.join(__dirname, 'public');

function loadJson(file, fallback) {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) return fallback;
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function saveJson(file, data) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
}

const hikes = loadJson('hikes.json', []);
const tours = loadJson('tours.json', []);
let bookings = loadJson('bookings.json', []);

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.jsx': 'text/javascript', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function sendJson(res, code, data) {
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

function getAvailability(type, id) {
  const item = type === 'hike' ? hikes.find(h => h.id === id) : tours.find(t => t.id === id);
  if (!item) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dates = {};
  for (let i = 1; i <= 30; i++) {
    const d = new Date(today); d.setDate(d.getDate() + i);
    const dow = d.getDay();
    if (item.daysOfWeek && !item.daysOfWeek.includes(dow)) continue;
    const key = d.toISOString().slice(0, 10);
    const bookedSlots = bookings
      .filter(b => b.itemId === id && b.date === key && b.status === 'confirmed')
      .map(b => b.time);
    const slots = (item.timeSlots || ['08:00', '10:00']).filter(s => !bookedSlots.includes(s));
    if (slots.length > 0) dates[key] = slots;
  }
  return { dates };
}

const server = http.createServer((req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') return sendJson(res, 200, {});

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // --- API Routes ---
  if (pathname.startsWith('/api/')) {
    const parts = pathname.split('/').filter(Boolean); // ['api', 'hikes', ...]

    if (parts[1] === 'hikes' && parts.length === 2 && req.method === 'GET')
      return sendJson(res, 200, hikes);
    if (parts[1] === 'hikes' && parts.length === 3 && req.method === 'GET') {
      const h = hikes.find(t => t.id === parts[2]);
      return h ? sendJson(res, 200, h) : sendJson(res, 404, { error: 'Not found' });
    }
    if (parts[1] === 'tours' && parts.length === 2 && req.method === 'GET')
      return sendJson(res, 200, tours);
    if (parts[1] === 'tours' && parts.length === 3 && req.method === 'GET') {
      const t = tours.find(t => t.id === parts[2]);
      return t ? sendJson(res, 200, t) : sendJson(res, 404, { error: 'Not found' });
    }
    if (parts[1] === 'availability' && parts.length === 4 && req.method === 'GET') {
      const result = getAvailability(parts[2], parts[3]);
      return result ? sendJson(res, 200, result) : sendJson(res, 404, { error: 'Not found' });
    }
    if (parts[1] === 'bookings' && parts.length === 2 && req.method === 'GET')
      return sendJson(res, 200, bookings);
    if (parts[1] === 'bookings' && parts.length === 2 && req.method === 'POST') {
      let body = '';
      req.on('data', c => body += c);
      req.on('end', () => {
        try {
          const { type, itemId, date, time, name, email, phone, people, notes } = JSON.parse(body);
          if (!type || !itemId || !date || !time || !name || !email)
            return sendJson(res, 400, { error: 'Missing required fields' });
          const item = type === 'hike' ? hikes.find(h => h.id === itemId) : tours.find(t => t.id === itemId);
          if (!item) return sendJson(res, 404, { error: 'Not found' });
          const existing = bookings.filter(b => b.itemId === itemId && b.date === date && b.time === time && b.status === 'confirmed');
          if (existing.length > 0) return sendJson(res, 409, { error: 'That slot is already booked' });
          const booking = {
            id: 'bk-' + Date.now().toString(36), type, itemId, itemName: item.name,
            date, time, name, email, phone: phone || '',
            people: parseInt(people) || 1, notes: notes || '',
            price: item.price * (parseInt(people) || 1),
            status: 'confirmed', createdAt: new Date().toISOString(),
          };
          bookings.push(booking);
          saveJson('bookings.json', bookings);
          return sendJson(res, 201, booking);
        } catch (e) {
          return sendJson(res, 400, { error: 'Invalid JSON' });
        }
      });
      return;
    }
    return sendJson(res, 404, { error: 'Not found' });
  }

  // --- Static files ---
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback
      fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (e2, d2) => {
        if (e2) return sendJson(res, 404, { error: 'Not found' });
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(d2);
      });
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => console.log(`Server on http://0.0.0.0:${PORT}`));
