import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--color-neutral-900)', color: 'var(--color-neutral-200)',
      padding: '56px 40px 40px',
    }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 40,
        maxWidth: 1240, margin: '0 auto',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 24, color: 'var(--color-neutral-100)' }}>
            Stellenbosch Adventures and Tours
          </span>
          <p style={{ margin: 0, maxWidth: '38ch', fontSize: 15, lineHeight: 1.65, color: 'var(--color-neutral-400)' }}>
            Guided hiking and tours in Pniel, Paarl and Stellenbosch. Rain or shine — mostly shine.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 15 }}>
          <span style={{ fontSize: 13, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>Explore</span>
          <Link to="/hikes" style={{ color: 'var(--color-neutral-200)' }}>Hikes</Link>
          <Link to="/tours" style={{ color: 'var(--color-neutral-200)' }}>Tours</Link>
          <Link to="/about" style={{ color: 'var(--color-neutral-200)' }}>Our Story</Link>
          <Link to="/book" style={{ color: 'var(--color-neutral-200)' }}>Book a Walk</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 15, color: 'var(--color-neutral-300)' }}>
          <span style={{ fontSize: 13, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>Say Hello</span>
          <span>hello@stellenboschadventures.co.za</span>
          <span>+27 21 000 0000</span>
          <span>Main Road, Pniel, 7681</span>
        </div>
      </div>
    </footer>
  );
}
