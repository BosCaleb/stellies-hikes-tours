import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

function money(n) { return 'R' + n.toLocaleString('en-ZA'); }

export default function ToursList() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTours()
      .then(data => { setTours(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '64px 40px 84px', maxWidth: 1240, margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 14px', fontSize: 54 }}>Tours</h1>
      <p style={{ margin: '0 0 30px', maxWidth: '58ch', fontSize: 18, lineHeight: 1.65, color: 'var(--color-neutral-700)' }}>
        Guided cultural, wine and nature tours through the Cape Winelands. Relaxed pace, local guides, and a story at every stop.
      </p>
      {loading ? (
        <p style={{ color: 'var(--color-neutral-600)' }}>Loading tours…</p>
      ) : (
        <div className="grid-2">
          {tours.map(t => (
            <article key={t.id} className="card elev-sm" style={{
              padding: 0, overflow: 'hidden', gap: 0,
              display: 'grid', gridTemplateColumns: '200px 1fr',
            }}>
              <div className="washed" style={{ height: '100%', minHeight: 220, overflow: 'hidden' }}>
                <img src={t.image} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '26px 28px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <span className="tag tag-outline">{t.difficulty}</span>
                  <span className="tag tag-neutral">{t.duration}</span>
                  <span className="tag tag-accent-2">{t.area}</span>
                </div>
                <h3 style={{ margin: 0, fontSize: 26, lineHeight: 1.15 }}>{t.name}</h3>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--color-neutral-700)' }}>{t.blurb}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 'auto', paddingTop: 12 }}>
                  <span style={{ fontSize: 16, color: 'var(--color-neutral-700)' }}>{money(t.price)} pp</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link to={`/tours/${t.id}`} className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: 14 }}>Details</Link>
                    <Link to={`/book/tour/${t.id}`} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>Book</Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
