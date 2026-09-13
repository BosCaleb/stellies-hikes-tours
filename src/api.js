import { generateAvailability } from '../server/availability.js';

const API = '/api';

// Static builds (`npm run build:static`, deployed to Azure Static Web Apps) have no API server.
// They read hikes and tours bundled from server/data, work out availability from each schedule in
// the browser (without seeing existing bookings), and BookingPage sends booking requests by email.
export const STATIC_SITE = import.meta.env.MODE === 'static';

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

const httpApi = {
  getHikes: () => fetchJson(`${API}/hikes`),
  getHike: (id) => fetchJson(`${API}/hikes/${id}`),
  getTours: () => fetchJson(`${API}/tours`),
  getTour: (id) => fetchJson(`${API}/tours/${id}`),
  getAvailability: (type, id) => fetchJson(`${API}/availability/${type}/${id}`),
  createBooking: (booking) => postJson(`${API}/bookings`, booking),
  getBookings: () => fetchJson(`${API}/bookings`),
};

async function loadStatic(type) {
  const data = type === 'hike'
    ? await import('../server/data/hikes.json')
    : await import('../server/data/tours.json');
  return data.default;
}

async function findStatic(type, id) {
  const item = (await loadStatic(type)).find(entry => entry.id === id);
  // Same error shape as fetchJson, so pages handle a missing item like an API 404.
  if (!item) throw new Error('API error: 404');
  return item;
}

const staticApi = {
  getHikes: () => loadStatic('hike'),
  getHike: (id) => findStatic('hike', id),
  getTours: () => loadStatic('tour'),
  getTour: (id) => findStatic('tour', id),
  getAvailability: async (type, id) => ({ dates: generateAvailability(await findStatic(type, id), []) }),
};

export const api = STATIC_SITE ? staticApi : httpApi;
