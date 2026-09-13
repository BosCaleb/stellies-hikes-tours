import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, 'data');
const bookingsPath = join(dataDir, 'bookings.json');

const readBookings = () => JSON.parse(readFileSync(bookingsPath, 'utf-8'));

beforeEach(() => {
  if (!existsSync(dataDir)) {
    throw new Error('Server data directory missing');
  }

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
});
