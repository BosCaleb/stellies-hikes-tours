import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api.js';

function money(n) { return 'R' + n.toLocaleString('en-ZA'); }

export default function DetailPage({ type }) {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (type === 'hike' ? api.getHike(id) : api.getTour(id))
      .then(data => { setItem(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id, type]);

  if (loading) return <div style={{ padding: 64, textAlign: 'center', color: 'var(--color-neutral-600)' }}>Loading…</div>;
  if (!item) return (
    <div style={{ padding: '64px 40px', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
      <h1>Not found</h1>
      <Link to={type === 'hike' ? '/hikes' : '/tours'} className="btn btn-secondary">Back to {type === 'hike' ? 'hikes' : 'tours'}</Link>
    </div>
  );

  return (
    <div style={{ padding: '64px 40px 84px', maxWidth: 1080, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <Link to={type === 'hike' ? '/hikes' : '/tours'} className="btn btn-ghost" style={{ fontSize: 15 }}>
          ← Back to {type === 'hike' ? 'hikes' : 'tours'}
        </Link>
      </div>
      <div className="washed" style={{ overflow: 'hidden', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', marginBottom: 34 }}>
        <img src={item.image} alt={item.name} style={{ width: '100%', height: 400, objectFit: 'cover' }} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <span className="tag tag-outline">{item.difficulty}</span>
        <span className="tag tag-neutral">{item.duration}</span>
        <span className="tag tag-accent-2">{item.area}</span>
      </div>
      <h1 style={{ margin: '0 0 18px', fontSize: 48 }}>{item.name}</h1>
      <p style={{ fontSize: 18, lineHeight: 1.7, color: 'var(--color-neutral-700)', maxWidth: '62ch', marginBottom: 30 }}>
        {item.description}
      </p>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
        padding: '24px 0', borderTop: '1px solid var(--color-divider)',
        borderBottom: '1px solid var(--color-divider)', marginBottom: 30,
      }}>
        <div><div style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>Distance</div><div style={{ fontSize: 17, fontWeight: 600 }}>{item.distance}</div></div>
        <div><div style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>Elevation</div><div style={{ fontSize: 17, fontWeight: 600 }}>{item.elevation}</div></div>
        <div><div style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>Duration</div><div style={{ fontSize: 17, fontWeight: 600 }}>{item.duration}</div></div>
        <div><div style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>Price</div><div style={{ fontSize: 17, fontWeight: 600 }}>{money(item.price)} pp</div></div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link to={`/book/${type}/${item.id}`} className="btn btn-primary btn-lg">Book this {type}</Link>
        <Link to={type === 'hike' ? '/hikes' : '/tours'} className="btn btn-secondary btn-lg">See more {type === 'hike' ? 'hikes' : 'tours'}</Link>
      </div>
    </div>
  );
}
