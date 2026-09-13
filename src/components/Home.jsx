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
      {/* Hero */}
      <section style={{
        display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 56,
        alignItems: 'center', padding: '76px 40px 64px', maxWidth: 1240, margin: '0 auto',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 24 }}>
          <span className="tag tag-accent-2" style={{ padding: '7px 16px' }}>Pniel · Paarl · Stellenbosch</span>
          <h1 style={{ margin: 0, fontSize: 66, lineHeight: 1.03, letterSpacing: '-.5px', maxWidth: '11ch' }}>
            Walk the mountains we grew up on.
          </h1>
          <p style={{ margin: 0, maxWidth: '46ch', fontSize: 19, lineHeight: 1.65, color: 'var(--color-neutral-700)' }}>
            Small guided hikes and tours through the Boland — granite domes above Paarl, fynbos ridges over Pniel, and the long green valleys behind Stellenbosch. Coffee at the start, a story at the top, and you're home by supper.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, paddingTop: 6 }}>
            <Link to="/book" className="btn btn-primary btn-lg">Book a Walk</Link>
            <Link to="/hikes" className="btn btn-secondary btn-lg">See all hikes</Link>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, paddingTop: 18, fontSize: 14, color: 'var(--color-neutral-600)' }}>
            <span>Groups of 8 or fewer</span>
            <span>Family &amp; kid-friendly routes</span>
            <span>Pickup in Stellenbosch</span>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', left: -38, bottom: -26, width: 150, height: 150,
            borderRadius: '999px', background: 'var(--color-accent-2-200)',
          }} />
          <div className="washed" style={{
            position: 'relative', overflow: 'hidden',
            borderRadius: '220px 220px 28px 28px', boxShadow: 'var(--shadow-lg)',
          }}>
            <img
              src="https://images.unsplash.com/photo-1464822759023-fed622ff22c6?auto=format&fit=crop&w=800&q=80"
              alt="Mountain ridge above Pniel at sunrise"
              style={{ width: '100%', height: 520, objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>

      {/* Featured */}
      <section style={{ padding: '16px 40px 84px', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, paddingBottom: 28 }}>
          <h2 style={{ margin: 0, fontSize: 40 }}>Three good places to start</h2>
          <Link to="/hikes" className="btn btn-ghost" style={{ fontSize: 16 }}>All hikes and tours →</Link>
        </div>
        <div className="grid-3">
          {loading ? (
            <p style={{ color: 'var(--color-neutral-600)' }}>Loading…</p>
          ) : (
            featured.map(item => (
              <article key={item.id} className="card elev-sm" style={{
                padding: 0, overflow: 'hidden', gap: 0,
              }}>
                <div className="washed" style={{ height: 196, overflow: 'hidden' }}>
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '24px 26px 26px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <span className="tag tag-outline">{item.difficulty}</span>
                    <span className="tag tag-neutral">{item.duration}</span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: 24, lineHeight: 1.2 }}>{item.name}</h3>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--color-neutral-700)' }}>{item.blurb}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 8 }}>
                    <span style={{ fontSize: 15, color: 'var(--color-neutral-600)' }}>{money(item.price)} pp</span>
                    <Link to={`/book/hike/${item.id}`} className="btn btn-secondary" style={{ padding: '9px 18px', fontSize: 14 }}>Book</Link>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* About teaser */}
      <section style={{ background: 'var(--color-surface)', padding: '78px 40px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '.9fr 1.1fr', gap: 56,
          alignItems: 'center', maxWidth: 1240, margin: '0 auto',
        }}>
          <div className="washed" style={{ overflow: 'hidden', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
            <img
              src="https://images.unsplash.com/photo-1454496522488-7a8e488e8786?auto=format&fit=crop&w=800&q=80"
              alt="The valley from Botmaskop"
              style={{ width: '100%', height: 380, objectFit: 'cover' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 20 }}>
            <h2 style={{ margin: 0, fontSize: 42, lineHeight: 1.1, maxWidth: '16ch' }}>A valley that feels like a kitchen table.</h2>
            <p style={{ margin: 0, maxWidth: '52ch', fontSize: 17, lineHeight: 1.7, color: 'var(--color-neutral-700)' }}>
              We're a family outfit from Pniel. Everyone who walks with us gets the same thing: a slow start, a guide who knows which farm road to take, rusks halfway, and time to sit at the top instead of rushing the descent.
            </p>
            <Link to="/about" className="btn btn-secondary" style={{ padding: '12px 24px' }}>Our story</Link>
          </div>
        </div>
      </section>

      {/* Who we walk with */}
      <section style={{ padding: '78px 40px', maxWidth: 1240, margin: '0 auto' }}>
        <h2 style={{ margin: '0 0 30px', fontSize: 40 }}>Who we walk with</h2>
        <div className="grid-3">
          <div className="card" style={{ gap: 10, padding: 30 }}>
            <h3 style={{ margin: 0, fontSize: 22 }}>Visiting the Winelands</h3>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: 'var(--color-neutral-700)' }}>
              Half-day walks that end at a farm table. We handle transfers from your guesthouse and the tasting booking after.
            </p>
          </div>
          <div className="card" style={{ gap: 10, padding: 30 }}>
            <h3 style={{ margin: 0, fontSize: 22 }}>Families with kids</h3>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: 'var(--color-neutral-700)' }}>
              Short, shaded routes with real things to find — waterfalls, tortoises, a picnic spot. Prams stay in the car; small legs are welcome.
            </p>
          </div>
          <div className="card" style={{ gap: 10, padding: 30 }}>
            <h3 style={{ margin: 0, fontSize: 22 }}>Hikers after a hard day</h3>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: 'var(--color-neutral-700)' }}>
              Full traverses with 1 200 m of climbing, early starts and no shuttle bail-out. Bring 3 litres and decent boots.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
