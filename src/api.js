const API = '/api';

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

export const api = {
  getHikes: () => fetchJson(`${API}/hikes`),
  getHike: (id) => fetchJson(`${API}/hikes/${id}`),
  getTours: () => fetchJson(`${API}/tours`),
  getTour: (id) => fetchJson(`${API}/tours/${id}`),
  getAvailability: (type, id) => fetchJson(`${API}/availability/${type}/${id}`),
  createBooking: (booking) => postJson(`${API}/bookings`, booking),
  getBookings: () => fetchJson(`${API}/bookings`),
};
