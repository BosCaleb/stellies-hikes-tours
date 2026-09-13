import { CONTACT } from '../data/contact.js';
import { money } from './format.js';

// mailto: link with a pre-filled booking request, used by the static site where there is no booking API.
export function bookingRequestMailto({ item, type, date, time, name, email, phone, people, notes }) {
  const subject = `Booking request: ${item.name} on ${date} at ${time}`;
  const body = [
    `Experience: ${item.name} (${type})`,
    `Date: ${date}`,
    `Time: ${time}`,
    `People: ${people}`,
    `Estimated total: ${money(item.price * people)}`,
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || '-'}`,
    '',
    `Notes: ${notes || '-'}`,
  ].join('\n');

  return `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
