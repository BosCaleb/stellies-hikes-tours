import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from 'vitest';
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const realDataDir = join(__dirname, 'data');

// Run the server against a throwaway copy of the data so tests never touch server/data/bookings.json.
// This has to happen before ./index.js is imported (each test imports it dynamically), because the
// server reads DATA_DIR and loads the JSON files at import time.
const dataDir = mkdtempSync(join(tmpdir(), 'stellies-test-data-'));
copyFileSync(join(realDataDir, 'hikes.json'), join(dataDir, 'hikes.json'));
copyFileSync(join(realDataDir, 'tours.json'), join(dataDir, 'tours.json'));
process.env.DATA_DIR = dataDir;

const bookingsPath = join(dataDir, 'bookings.json');
const readBookings = () => JSON.parse(readFileSync(bookingsPath, 'utf-8'));

beforeEach(() => {
  const seed = [
    {
      id: 'bk-1',
      type: 'hike',
      itemId: 'pniel-sunrise',
      itemName: 'Pniel Ridge Sunrise',
      date: '2026-09-15',
      time: '05:30',
      name: 'Existing Guest',
      email: 'guest@example.com',
      phone: '',
      people: 2,
      notes: '',
      price: 900,
      status: 'confirmed',
      createdAt: '2026-09-01T00:00:00.000Z',
    },
    {
      id: 'bk-2',
      type: 'hike',
      itemId: 'pniel-sunrise',
      itemName: 'Pniel Ridge Sunrise',
      date: '2026-09-15',
      time: '06:00',
      name: 'Second Booking',
      email: 'second@example.com',
      phone: '',
      people: 1,
      notes: '',
      price: 450,
      status: 'confirmed',
      createdAt: '2026-09-01T00:01:00.000Z',
    },
  ];

  writeFileSync(bookingsPath, JSON.stringify(seed, null, 2));
});

afterEach(() => {
  vi.restoreAllMocks();
});

afterAll(() => {
  rmSync(dataDir, { recursive: true, force: true });
});

describe('server booking checks', () => {
  it('detects a conflicting confirmed booking for the same item, date, and time', async () => {
    const { checkBookingConflict } = await import('./index.js');
    const conflicting = checkBookingConflict(readBookings(), {
      itemId: 'pniel-sunrise',
      date: '2026-09-15',
      time: '05:30',
    });

    expect(conflicting).toBe(true);
  });

  it('allows a different time slot on the same date', async () => {
    const { checkBookingConflict } = await import('./index.js');
    const conflicting = checkBookingConflict(readBookings(), {
      itemId: 'pniel-sunrise',
      date: '2026-09-15',
      time: '07:00',
    });

    expect(conflicting).toBe(false);
  });

  it('returns the available slots for a date after excluding confirmed bookings', async () => {
    const { getAvailableSlotsForDate } = await import('./index.js');
    const item = {
      id: 'pniel-sunrise',
      timeSlots: ['05:30', '06:00', '07:00'],
    };

    const slots = getAvailableSlotsForDate({
      item,
      dateKey: '2026-09-15',
      bookings: readBookings(),
    });

    expect(slots).toEqual(['07:00']);
  });

  it('keeps unbooked slots available when no conflict exists', async () => {
    const { generateAvailability } = await import('./index.js');
    const item = {
      id: 'pniel-sunrise',
      daysOfWeek: [2],
      timeSlots: ['05:30', '06:00', '07:00'],
    };

    const dates = generateAvailability(item, readBookings(), new Date('2026-09-14T00:00:00Z'));

    expect(dates['2026-09-15']).toEqual(['07:00']);
    expect(dates['2026-09-22']).toEqual(['05:30', '06:00', '07:00']);
  });

  it('keys each available date by its South African calendar date and weekday', async () => {
    const { generateAvailability } = await import('./index.js');
    const item = { id: 'pniel-sunrise', daysOfWeek: [1, 3, 5, 6], timeSlots: ['05:30'] };

    // Sunday 13 September 2026, 09:00 in South Africa.
    const dates = generateAvailability(item, [], new Date('2026-09-13T07:00:00Z'));
    const keys = Object.keys(dates);

    expect(keys[0]).toBe('2026-09-14'); // Monday
    for (const key of keys) {
      expect(item.daysOfWeek).toContain(new Date(`${key}T00:00:00Z`).getUTCDay());
    }
  });

  it('uses the South African date even when UTC is still on the previous day', async () => {
    const { businessDateParts, generateAvailability } = await import('./index.js');
    const item = { id: 'pniel-sunrise', daysOfWeek: [1, 3, 5, 6], timeSlots: ['05:30'] };

    // 22:30 UTC on Sunday is already 00:30 on Monday 14 September in South Africa.
    const now = new Date('2026-09-13T22:30:00Z');

    expect(businessDateParts(now)).toEqual({ year: 2026, month: 9, day: 14 });
    // Availability starts tomorrow (Tuesday), so the first scheduled day is Wednesday.
    expect(Object.keys(generateAvailability(item, [], now))[0]).toBe('2026-09-16');
  });

  it('saves new bookings to the temporary data directory, not server/data', async () => {
    const { app } = await import('./index.js');
    const realBookingsBefore = readFileSync(join(realDataDir, 'bookings.json'), 'utf-8');

    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    try {
      const { port } = server.address();
      const res = await fetch(`http://127.0.0.1:${port}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'hike',
          itemId: 'paarl-rock',
          date: '2026-09-14',
          time: '08:00',
          name: 'Temp File Guest',
          email: 'temp@example.com',
          people: 2,
        }),
      });
      expect(res.status).toBe(201);
    } finally {
      await new Promise(resolve => server.close(resolve));
    }

    expect(readBookings().some(b => b.name === 'Temp File Guest')).toBe(true);
    expect(readFileSync(join(realDataDir, 'bookings.json'), 'utf-8')).toBe(realBookingsBefore);
  });
});
