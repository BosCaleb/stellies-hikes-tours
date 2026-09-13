import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div style={{ padding: '64px 40px 84px', maxWidth: 1000, margin: '0 auto' }}>
      <span className="tag tag-accent" style={{ padding: '7px 16px' }}>Since 2014</span>
      <h1 style={{ margin: '18px 0 22px', fontSize: 54, lineHeight: 1.06, maxWidth: '16ch' }}>
        Three generations of walking the same mountains.
      </h1>
      <div className="washed" style={{ overflow: 'hidden', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', marginBottom: 38 }}>
        <img
          src="https://images.unsplash.com/photo-1533240332313-0db49b459b8c?auto=format&fit=crop&w=1000&q=80"
          alt="The Stellenbosch Adventures team"
          style={{ width: '100%', height: 400, objectFit: 'cover' }}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 44 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <p style={{ margin: 0, fontSize: 18, lineHeight: 1.75, color: 'var(--color-neutral-800)' }}>
            Stellenbosch Adventures and Tours started with a father walking his kids up to the Pniel forest on Sunday afternoons, and guests from the guesthouse next door asking to come along. Twelve years later it's still the same walk, the same rusks, and mostly the same family.
          </p>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.75, color: 'var(--color-neutral-700)' }}>
            We guide in English, Afrikaans and isiXhosa. Our guides are locals who know the farms, the fire seasons and which path turns to mud after rain — and we keep groups small enough that nobody walks alone at the back.
          </p>
          <Link to="/book" className="btn btn-primary" style={{ padding: '12px 24px', marginTop: 8 }}>Book a walk</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ gap: 8, padding: 26 }}>
            <h3 style={{ margin: 0, fontSize: 20 }}>Small groups, always</h3>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--color-neutral-700)' }}>
              Eight guests maximum, two guides on anything strenuous.
            </p>
          </div>
          <div className="card" style={{ gap: 8, padding: 26 }}>
            <h3 style={{ margin: 0, fontSize: 20 }}>Paid-up locals</h3>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--color-neutral-700)' }}>
              Every guide is from Pniel, Kylemore or Stellenbosch, and gets a full share of the tip.
            </p>
          </div>
          <div className="card" style={{ gap: 8, padding: 26 }}>
            <h3 style={{ margin: 0, fontSize: 20 }}>Fynbos first</h3>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--color-neutral-700)' }}>
              We walk on-path, carry out what we carry in, and pay a levy per hiker to the local conservancy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
