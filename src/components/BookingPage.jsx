import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, STATIC_SITE } from '../api.js';
import { CONTACT } from '../data/contact.js';
import { bookingRequestMailto } from '../utils/bookingEmail.js';
import { money } from '../utils/format.js';
import Icon from './Icon.jsx';
import VueCalendar from './VueCalendar.jsx';

export default function BookingPage() {
  const { type: paramType, id: paramId } = useParams();
  const [hikes, setHikes] = useState([]);
  const [tours, setTours] = useState([]);
  const [selectedType, setSelectedType] = useState(paramType || 'hike');
  const [selectedId, setSelectedId] = useState(paramId || '');
  const [availability, setAvailability] = useState({ dates: {} });
  const [selection, setSelection] = useState({ date: null, time: null });
  const [form, setForm] = useState({ name: '', email: '', phone: '', people: 2, notes: '' });
  const [booked, setBooked] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load hikes + tours
  useEffect(() => {
    Promise.all([api.getHikes(), api.getTours()])
      .then(([h, t]) => {
        setHikes(h);
        setTours(t);
        if (!paramId) {
          setSelectedId(h[0]?.id || '');
          setSelectedType('hike');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Load availability when selection changes
  useEffect(() => {
    if (!selectedId || !selectedType) return;
    setSelection({ date: null, time: null });
    api.getAvailability(selectedType, selectedId)
      .then(data => setAvailability(data))
      .catch(() => setAvailability({ dates: {} }));
  }, [selectedId, selectedType]);

  const allItems = [
    ...hikes.map(h => ({ ...h, type: 'hike' })),
    ...tours.map(t => ({ ...t, type: 'tour' })),
  ];
  const selectedItem = allItems.find(i => i.id === selectedId && i.type === selectedType) || allItems[0];
  const people = Math.max(1, Math.min(8, parseInt(form.people) || 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selection.date || !selection.time) {
      setError('Please pick a date and time.');
      return;
    }
    if (!form.name || !form.email) {
      setError('Please enter your name and email.');
      return;
    }

    if (STATIC_SITE) {
      // No booking API on the static site: open a pre-filled email to the business instead.
      const mailto = bookingRequestMailto({
        item: selectedItem,
        type: selectedType,
        date: selection.date,
        time: selection.time,
        name: form.name,
        email: form.email,
        phone: form.phone,
        people,
        notes: form.notes,
      });
      window.location.href = mailto;
      setBooked({ itemName: selectedItem.name, date: selection.date, time: selection.time, people, mailto, requestOnly: true });
      window.scrollTo(0, 0);
      return;
    }

    setSubmitting(true);
    try {
      const booking = await api.createBooking({
        type: selectedType,
        itemId: selectedId,
        date: selection.date,
        time: selection.time,
        name: form.name,
        email: form.email,
        phone: form.phone,
        people: form.people,
        notes: form.notes,
      });
      setBooked(booking);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="state state--page">Loading…</p>;

  if (booked) {
    const peopleLabel = `${booked.people} ${booked.people === 1 ? 'person' : 'people'}`;

    return (
      <section className="section">
        <div className="container narrow">
          <div className="confirmation">
            <span className="confirmation__icon">
              <Icon name={booked.requestOnly ? 'mail' : 'check'} size={28} />
            </span>
            {booked.requestOnly ? (
              <>
                <span className="eyebrow">Booking request</span>
                <h1>Almost there: send us your request.</h1>
                <p>
                  Your email app should have opened with a request for <strong>{booked.itemName}</strong> on{' '}
                  {booked.date} at {booked.time}, {peopleLabel}. Send it and we'll confirm availability within a day.
                  If nothing opened, email the same details to <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.
                </p>
              </>
            ) : (
              <>
                <span className="eyebrow">Booking received</span>
                <h1>You're on the mountain list.</h1>
                <p>
                  We've got you down for <strong>{booked.itemName}</strong> on {booked.date} at {booked.time},{' '}
                  {peopleLabel}. Look out for a note from us within a day — meeting point, kit list and the weather call.
                </p>
              </>
            )}
            <div className="confirmation__actions">
              {booked.requestOnly && <a href={booked.mailto} className="btn btn-primary">Open the email again</a>}
              <Link to="/" className={`btn ${booked.requestOnly ? 'btn-secondary' : 'btn-primary'}`}>Back home</Link>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setBooked(null); setSelection({ date: null, time: null }); }}
              >
                Book another walk
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="booking-header">
        <div className="container">
          <span className="eyebrow">Reserve your spot</span>
          <h1>Book a walk</h1>
          <p className="lead">
            Pick a hike or tour, choose a date and time, and we’ll confirm your slot by email with the meeting
            point and a simple kit list.
          </p>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container booking-layout">
          <form onSubmit={handleSubmit} className="form-card">
            <div className="form-step">
              <h2 className="form-step__title"><span className="form-step__number">1</span>Choose your experience</h2>
              <div className="option-list">
                {[...hikes, ...tours].map(item => {
                  const itemType = item.type || (hikes.some(h => h.id === item.id) ? 'hike' : 'tour');
                  const selected = selectedId === item.id && selectedType === itemType;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`option${selected ? ' is-selected' : ''}`}
                      aria-pressed={selected}
                      onClick={() => {
                        setSelectedType(itemType);
                        setSelectedId(item.id);
                      }}
                    >
                      <img className="option__thumb" src={item.image} alt="" loading="lazy" />
                      <span className="option__text">
                        <span className="option__title">{item.name}</span>
                        <span className="option__meta">
                          {item.area} · {item.duration} · {itemType === 'hike' ? item.difficulty : 'Tour'}
                        </span>
                      </span>
                      <span className="option__price">{money(item.price)} pp</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-step">
              <h2 className="form-step__title"><span className="form-step__number">2</span>Pick a date &amp; time</h2>
              <div className="calendar-panel">
                <VueCalendar
                  availability={availability}
                  onSelected={(val) => setSelection(val)}
                />
              </div>
              {STATIC_SITE && (
                <p className="form-step__note">
                  Highlighted dates show when this walk runs. We'll confirm your spot by email before anything is booked.
                </p>
              )}
            </div>

            <div className="form-step">
              <h2 className="form-step__title"><span className="form-step__number">3</span>Your details</h2>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="booking-name">Your name</label>
                  <input id="booking-name" className="input" type="text" autoComplete="name" placeholder="Thandi Meyer"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="booking-email">Email</label>
                  <input id="booking-email" className="input" type="email" autoComplete="email" placeholder="you@example.com"
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="booking-people">How many people</label>
                  <input id="booking-people" className="input" type="number" min="1" max="8"
                    value={form.people} onChange={e => setForm({ ...form, people: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="booking-phone">Phone (optional)</label>
                  <input id="booking-phone" className="input" type="tel" autoComplete="tel" placeholder="+27 82 000 0000"
                    value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="field field--full">
                  <label htmlFor="booking-notes">Anything we should know?</label>
                  <textarea id="booking-notes" className="input" placeholder="Kids' ages, knees, dietary things, where you're staying."
                    value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
            </div>

            {error && <div className="alert alert--error" role="alert">{error}</div>}

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting}>
              {submitting ? 'Booking…' : STATIC_SITE ? 'Email this booking request' : 'Request this booking'}
            </button>
          </form>

          <aside className="summary-card" aria-label="Booking summary">
            {selectedItem && (
              <div className="summary-card__media">
                <img src={selectedItem.image} alt={selectedItem.imageAlt || selectedItem.name} />
              </div>
            )}
            <div className="summary-card__body">
              <div>
                <span className="eyebrow">Your booking</span>
                <h2 className="summary-card__title">{selectedItem?.name || 'Select a hike'}</h2>
              </div>
              <p className="summary-card__blurb">
                {selectedItem?.blurb || 'Choose an experience to see the route details and your booking summary.'}
              </p>
              <dl className="summary-list">
                <div><dt>Area</dt><dd>{selectedItem?.area || '—'}</dd></div>
                <div><dt>Difficulty</dt><dd>{selectedItem?.difficulty || '—'}</dd></div>
                <div><dt>Duration</dt><dd>{selectedItem?.duration || '—'}</dd></div>
                <div><dt>Date</dt><dd>{selection.date || 'Not selected'}</dd></div>
                <div><dt>Time</dt><dd>{selection.time || '—'}</dd></div>
                <div><dt>People</dt><dd>{people}</dd></div>
              </dl>
              <div className="summary-total">
                <span>Total</span>
                <span className="summary-total__value">{selectedItem ? money(selectedItem.price * people) : '—'}</span>
              </div>
              <p className="summary-note">
                Nothing is charged now — we confirm availability first and send a payment link once your date is locked in.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
