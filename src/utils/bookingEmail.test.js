import { CONTACT } from '../data/contact.js';
import { bookingRequestMailto } from './bookingEmail.js';

describe('bookingRequestMailto', () => {
  it('addresses the business and includes every booking detail', () => {
    const url = bookingRequestMailto({
      item: { name: 'Paarl Rock & the Granite Domes', price: 420 },
      type: 'hike',
      date: '2026-09-14',
      time: '08:00',
      name: 'Thandi Meyer',
      email: 'thandi@example.com',
      phone: '',
      people: 2,
      notes: 'Two kids, ages 8 & 10',
    });

    const [address, query] = url.replace(/^mailto:/, '').split('?');
    const params = new URLSearchParams(query);
    const body = params.get('body');

    expect(address).toBe(CONTACT.email);
    expect(params.get('subject')).toBe('Booking request: Paarl Rock & the Granite Domes on 2026-09-14 at 08:00');
    for (const line of [
      'Experience: Paarl Rock & the Granite Domes (hike)',
      'Date: 2026-09-14',
      'Time: 08:00',
      'People: 2',
      'Name: Thandi Meyer',
      'Email: thandi@example.com',
      'Phone: -',
      'Notes: Two kids, ages 8 & 10',
    ]) {
      expect(body).toContain(line);
    }
  });
});
