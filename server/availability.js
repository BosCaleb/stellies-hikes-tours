// Pure booking and availability logic, shared by the Express API (server/index.js) and the static
// site build (src/api.js under `npm run build:static`). Keep it free of Node-only imports.

// Walks are scheduled in South African time, whatever timezone the code runs in (Docker defaults to UTC).
const BUSINESS_TIME_ZONE = 'Africa/Johannesburg';
const DAY_MS = 24 * 60 * 60 * 1000;

export function checkBookingConflict(bookings, { itemId, date, time }) {
  return bookings.some(
    b => b.itemId === itemId && b.date === date && b.time === time && b.status === 'confirmed'
  );
}

export function getAvailableSlotsForDate({ item, dateKey, bookings }) {
  const bookedSlots = bookings
    .filter(b => b.itemId === item.id && b.date === dateKey && b.status === 'confirmed')
    .map(b => b.time);

  return (item.timeSlots || ['08:00', '10:00']).filter(
    slot => !bookedSlots.includes(slot)
  );
}

// Calendar date of `date` in the business timezone, as numbers (month is 1-based).
export function businessDateParts(date, timeZone = BUSINESS_TIME_ZONE) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: 'numeric', day: 'numeric' })
      .formatToParts(date)
      .map(part => [part.type, part.value])
  );
  return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day) };
}

export function generateAvailability(item, bookings, today = new Date()) {
  const { year, month, day } = businessDateParts(today);
  const start = Date.UTC(year, month - 1, day);
  const dates = {};

  for (let i = 1; i <= 30; i++) {
    // UTC midnight of each business-calendar day, so getUTCDay() and toISOString() both describe that day.
    // (Local-midnight dates would shift back a day through toISOString() anywhere east of UTC.)
    const d = new Date(start + i * DAY_MS);
    const dow = d.getUTCDay();
    if (item.daysOfWeek && !item.daysOfWeek.includes(dow)) continue;

    const key = d.toISOString().slice(0, 10);
    const slots = getAvailableSlotsForDate({ item, dateKey: key, bookings });
    if (slots.length > 0) dates[key] = slots;
  }

  return dates;
}
