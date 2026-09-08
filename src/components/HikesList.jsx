import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

function money(n) { return 'R' + n.toLocaleString('en-ZA'); }

export default function HikesList() {
  const [hikes, setHikes] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getHikes()
      .then(data => { setHikes(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filters = ['All', 'Easy', 'Moderate', 'Strenuous'];
  const matches = (h) => filter === 'All' || h.difficulty.toLowerCase().startsWith(filter.toLowerCase());
  const visible = hikes.filter(matches);

  return (
    <div style={{ padding: '64px 40px 84px', maxWidth: 1240, margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 14px', fontSize: 54 }}>Hikes</h1>
      <p style={{ margin: '0 0 30px', maxWidth: '58ch', fontSize: 18, lineHeight: 1.65, color: 'var(--color-neutral-700)' }}>
        Every walk runs with eight people or fewer. Prices are per person and include a guide, permits, water and something to eat at the top.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, paddingBottom: 34 }}>
        {filters.map(label => (
          <button
            key={label}
            onClick={() => setFilter(label)}
            className="btn"
            style={{
              padding: '9px 20px', borderRadius: '999px', fontSize: 15,
              border: `1px solid ${filter === label ? 'var(--color-accent)' : 'var(--color-divider)'}`,
              background: filter === label ? 'var(--color-accent)' : 'transparent',
              color: filter === label ? 'var(--color-bg)' : 'var(--color-neutral-700)',
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {loading ? (
        <p style={{ color: 'var(--color-neutral-600)' }}>Loading hikes…</p>
      ) : (
        <div className="grid-2">
          {visible.map(h => (
            <article key={h.id} className="card elev-sm" style={{
              padding: 0, overflow: 'hidden', gap: 0,
              display: 'grid', gridTemplateColumns: '200px 1fr',
            }}>
              <div className="washed" style={{ height: '100%', minHeight: 220, overflow: 'hidden' }}>
                <img src={h.image} alt={h.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '26px 28px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <span className="tag tag-outline">{h.difficulty}</span>
                  <span className="tag tag-neutral">{h.duration}</span>
                  <span className="tag tag-accent-2">{h.area}</span>
                </div>
                <h3 style={{ margin: 0, fontSize: 26, lineHeight: 1.15 }}>{h.name}</h3>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--color-neutral-700)' }}>{h.blurb}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 'auto', paddingTop: 12 }}>
                  <span style={{ fontSize: 16, color: 'var(--color-neutral-700)' }}>{money(h.price)} pp</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link to={`/hikes/${h.id}`} className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: 14 }}>Details</Link>
                    <Link to={`/book/hike/${h.id}`} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>Book</Link>
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
