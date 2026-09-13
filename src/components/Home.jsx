import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

function money(n) { return 'R' + n.toLocaleString('en-ZA'); }

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getHikes(), api.getTours()])
      .then(([hikes, tours]) => {
        setFeatured([
          ...hikes.slice(0, 2),
          ...tours.slice(0, 1),
        ]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <section style={{
        display: 'grid',
        gridTemplateColumns: '1.08fr 0.92fr',
        gap: 56,
        alignItems: 'center',
        padding: '72px 40px 56px',
        maxWidth: 1240,
        margin: '0 auto',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 22 }}>
          <span className="tag tag-accent-2" style={{ padding: '8px 16px' }}>Pniel · Paarl · Stellenbosch</span>
          <h1 style={{ margin: 0, maxWidth: '11ch', letterSpacing: '-0.04em' }}>
            Walk the mountains we know by heart.
          </h1>
          <p style={{ margin: 0, maxWidth: '46ch', fontSize: 18, lineHeight: 1.7, color: 'var(--color-neutral-700)' }}>
            Small-group hikes and tours through the Boland — granite domes, fynbos ridges, vineyard roads and mountain views from the best seats in the valley.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, paddingTop: 4 }}>
            <Link to="/book" className="btn btn-primary btn-lg">Book a walk</Link>
            <Link to="/hikes" className="btn btn-secondary btn-lg">Explore hikes</Link>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 22, paddingTop: 12, fontSize: 14, color: 'var(--color-neutral-600)' }}>
            <span>Small groups</span>
            <span>Local guides</span>
            <span>Pickup available</span>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', left: '-18px', bottom: '-18px', width: 160, height: 160,
            borderRadius: '999px', background: 'var(--color-accent-2-200)',
          }} />
          <div className="washed" style={{
            position: 'relative', overflow: 'hidden',
            borderRadius: '220px 220px 26px 26px', boxShadow: 'var(--shadow-lg)',
          }}>
            <img
              src="https://images.unsplash.com/photo-1464822759023-fed622ff22c6?auto=format&fit=crop&w=900&q=80"
              alt="Mountain ridge above Pniel at sunrise"
              style={{ width: '100%', height: 540, objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>

      <section style={{ padding: '16px 40px 84px', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, paddingBottom: 28, flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0 }}>Three good places to start</h2>
          <Link to="/hikes" className="btn btn-ghost" style={{ fontSize: 16 }}>View all experiences →</Link>
        </div>
        <div className="grid-3">
          {loading ? (
            <p style={{ color: 'var(--color-neutral-600)' }}>Loading…</p>
          ) : (
            featured.map(item => (
              <article key={item.id} className="card elev-sm" style={{ padding: 0, overflow: 'hidden', gap: 0 }}>
                <div className="washed" style={{ height: 196, overflow: 'hidden' }}>
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '24px 24px 22px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <span className="tag tag-outline">{item.difficulty}</span>
                    <span className="tag tag-neutral">{item.duration}</span>
                  </div>
                  <h3 style={{ margin: 0 }}>{item.name}</h3>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--color-neutral-700)' }}>{item.blurb}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 8 }}>
                    <span style={{ fontSize: 15, color: 'var(--color-neutral-600)' }}>{money(item.price)} pp</span>
                    <Link to={`/book/hike/${item.id}`} className="btn btn-secondary" style={{ padding: '10px 18px', fontSize: 14 }}>Book</Link>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section style={{ background: 'rgba(255,255,255,0.24)', padding: '76px 40px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '.95fr 1.05fr', gap: 52,
          alignItems: 'center', maxWidth: 1240, margin: '0 auto',
        }}>
          <div className="washed" style={{ overflow: 'hidden', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
            <img
              src="https://images.unsplash.com/photo-1454496522488-7a8e488e8786?auto=format&fit=crop&w=900&q=80"
              alt="Breathtaking valley panorama from the mountain trail"
              style={{ width: '100%', height: 390, objectFit: 'cover' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 18 }}>
            <span className="tag tag-accent" style={{ padding: '8px 14px' }}>Why travellers book with us</span>
            <h2 style={{ margin: 0, maxWidth: '14ch' }}>A local way to experience the Boland.</h2>
            <p style={{ margin: 0, maxWidth: '54ch', fontSize: 17, lineHeight: 1.75, color: 'var(--color-neutral-700)' }}>
              We keep things personal: early starts, warm coffee, proper mountain routes and a guide who knows exactly where to stop for a view, a story and a good lunch spot.
            </p>
            <Link to="/about" className="btn btn-secondary" style={{ padding: '12px 22px' }}>Our story</Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '78px 40px 94px', maxWidth: 1240, margin: '0 auto' }}>
        <h2 style={{ margin: '0 0 30px' }}>Who we walk with</h2>
        <div className="grid-3">
          <div className="card" style={{ gap: 10, padding: 30 }}>
            <h3 style={{ margin: 0 }}>Winelands visitors</h3>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: 'var(--color-neutral-700)' }}>
              Half-day walks and vineyard routes designed for a relaxed, memorable day out from Stellenbosch or Paarl.
            </p>
          </div>
          <div className="card" style={{ gap: 10, padding: 30 }}>
            <h3 style={{ margin: 0 }}>Families with kids</h3>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: 'var(--color-neutral-700)' }}>
              Shorter routes, local guides and plenty of time to take in the view without feeling rushed.
            </p>
          </div>
          <div className="card" style={{ gap: 10, padding: 30 }}>
            <h3 style={{ margin: 0 }}>Serious hikers</h3>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: 'var(--color-neutral-700)' }}>
              Steady climbs, full-day routes and a measured pace for guests who want the challenge without the crowd.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
