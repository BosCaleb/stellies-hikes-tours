import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api.js';
import VueCalendar from './VueCalendar.jsx';

function money(n) { return 'R' + n.toLocaleString('en-ZA'); }

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

  if (loading) return <div style={{ padding: 64, textAlign: 'center', color: 'var(--color-neutral-600)' }}>Loading…</div>;

  if (booked) {
    return (
      <div style={{ padding: '64px 40px 84px', maxWidth: 1080, margin: '0 auto' }}>
        <div className="card elev-md" style={{
          gap: 14, padding: 44, background: 'var(--color-accent-2-100)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <h2 style={{ margin: 0, fontSize: 34 }}>You're on the mountain list.</h2>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.7, color: 'var(--color-neutral-800)', maxWidth: '52ch' }}>
            We've got you down for <strong>{booked.itemName}</strong> on {booked.date} at {booked.time}, {booked.people} {booked.people === 1 ? 'person' : 'people'}.
            Look out for a note from us within a day — meeting point, kit list and the weather call.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
            <Link to="/" className="btn btn-primary" style={{ padding: '12px 24px' }}>Back home</Link>
            <button
              className="btn btn-secondary"
              style={{ padding: '12px 24px' }}
              onClick={() => { setBooked(null); setSelection({ date: null, time: null }); }}
            >
              Book another walk
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '64px 40px 84px', maxWidth: 1080, margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 12px', fontSize: 52 }}>Book a walk</h1>
      <p style={{ margin: '0 0 34px', maxWidth: '54ch', fontSize: 18, lineHeight: 1.65, color: 'var(--color-neutral-700)' }}>
        Pick a hike or tour, choose a date and time, and we'll confirm by email within a day with a meeting point and a kit list.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr .75fr', gap: 34, alignItems: 'start' }}>
        {/* Left: Form */}
        <form onSubmit={handleSubmit} className="card" style={{ gap: 20, padding: 34 }}>
          {/* Item selection */}
          <div className="field">
            <label>Which hike or tour</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {hikes.map(h => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => { setSelectedType('hike'); setSelectedId(h.id); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 16, padding: '14px 18px', borderRadius: 'var(--radius-md)',
                    border: `1px solid ${selectedId === h.id && selectedType === 'hike' ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                    background: selectedId === h.id && selectedType === 'hike' ? 'var(--color-accent-100)' : 'transparent',
                    color: 'var(--color-text)', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span style={{ fontSize: 16, fontWeight: 600 }}>{h.name}</span>
                    <span style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>{h.area} · {h.duration} · {h.difficulty}</span>
                  </span>
                  <span style={{ fontSize: 15, color: 'var(--color-neutral-700)' }}>{money(h.price)} pp</span>
                </button>
              ))}
              {tours.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { setSelectedType('tour'); setSelectedId(t.id); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 16, padding: '14px 18px', borderRadius: 'var(--radius-md)',
                    border: `1px solid ${selectedId === t.id && selectedType === 'tour' ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                    background: selectedId === t.id && selectedType === 'tour' ? 'var(--color-accent-100)' : 'transparent',
                    color: 'var(--color-text)', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span style={{ fontSize: 16, fontWeight: 600 }}>{t.name}</span>
                    <span style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>{t.area} · {t.duration} · Tour</span>
                  </span>
                  <span style={{ fontSize: 15, color: 'var(--color-neutral-700)' }}>{money(t.price)} pp</span>
                </button>
              ))}
            </div>
          </div>

          {/* Vue Calendar (cal.diy-inspired date/time picker) */}
          <div className="field">
            <label>Pick a date &amp; time</label>
            <div style={{ padding: 20, borderRadius: 'var(--radius-md)', background: 'var(--color-neutral-100)' }}>
              <VueCalendar
                availability={availability}
                onSelected={(val) => setSelection(val)}
              />
            </div>
          </div>

          {/* People */}
          <div className="field">
            <label>How many people</label>
            <input
              className="input"
              type="number"
              min="1"
              max="8"
              value={form.people}
              onChange={e => setForm({ ...form, people: e.target.value })}
            />
          </div>

          {/* Name + Email */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="field">
              <label>Your name</label>
              <input className="input" type="text" placeholder="Thandi Meyer"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field">
              <label>Email</label>
              <input className="input" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>

          {/* Phone */}
          <div className="field">
            <label>Phone (optional)</label>
            <input className="input" type="tel" placeholder="+27 82 000 0000"
              value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>

          {/* Notes */}
          <div className="field">
            <label>Anything we should know?</label>
            <textarea className="input" placeholder="Kids' ages, knees, dietary things, where you're staying."
              value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>

          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--color-accent-100)', color: 'var(--color-accent-800)', fontSize: 14 }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}
            style={{ minHeight: 52, fontSize: 17, opacity: submitting ? 0.6 : 1 }}>
            {submitting ? 'Booking…' : 'Request this booking'}
          </button>
        </form>

        {/* Right: Summary sidebar */}
        <aside className="card elev-sm" style={{
          position: 'sticky', top: 96, gap: 14, padding: 30,
          background: 'var(--color-surface)',
        }}>
          <h3 style={{ margin: 0, fontSize: 24 }}>{selectedItem?.name || 'Select a hike'}</h3>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--color-neutral-700)' }}>
            {selectedItem?.blurb || ''}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, paddingTop: 6, borderTop: '1px solid var(--color-divider)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
              <span style={{ color: 'var(--color-neutral-600)' }}>Difficulty</span>
              <span>{selectedItem?.difficulty || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
              <span style={{ color: 'var(--color-neutral-600)' }}>On the trail</span>
              <span>{selectedItem?.duration || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
              <span style={{ color: 'var(--color-neutral-600)' }}>Date</span>
              <span>{selection.date || 'Not selected'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
              <span style={{ color: 'var(--color-neutral-600)' }}>Time</span>
              <span>{selection.time || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
              <span style={{ color: 'var(--color-neutral-600)' }}>People</span>
              <span>{people}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 12, borderTop: '1px solid var(--color-divider)' }}>
              <span style={{ fontSize: 15, color: 'var(--color-neutral-600)' }}>Total</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 30 }}>
                {selectedItem ? money(selectedItem.price * people) : '—'}
              </span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: 'var(--color-neutral-600)' }}>
            Nothing is charged now — we confirm availability first and send a payment link.
          </p>
        </aside>
      </div>
    </div>
  );
}
