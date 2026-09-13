import { Link, NavLink } from 'react-router-dom';

export default function Header() {
  const navItems = [
    { to: '/', label: 'Home', end: true },
    { to: '/hikes', label: 'Hikes' },
    { to: '/tours', label: 'Tours' },
    { to: '/about', label: 'Our Story' },
  ];

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 20,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 24, padding: '16px 40px',
      background: 'color-mix(in srgb, var(--color-bg) 92%, transparent)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--color-divider)',
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--color-text)' }}>
        <span style={{
          display: 'grid', placeItems: 'center', width: 42, height: 42,
          borderRadius: '999px', background: 'var(--color-accent-2-500)',
          color: 'var(--color-neutral-100)', fontFamily: 'var(--font-heading)',
          fontSize: 19, lineHeight: 1,
        }}>S</span>
        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 19 }}>Stellenbosch Adventures</span>
          <span style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>and Tours</span>
        </span>
      </Link>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            style={({ isActive }) => ({
              padding: '9px 16px', borderRadius: '999px', fontSize: 15,
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--color-accent-700)' : 'var(--color-text)',
              background: isActive ? 'var(--color-accent-100)' : 'transparent',
            })}
          >
            {item.label}
          </NavLink>
        ))}
        <Link to="/book" className="btn btn-primary" style={{ marginLeft: 10, padding: '10px 22px', fontSize: 15 }}>
          Book a Walk
        </Link>
      </nav>
    </header>
  );
}
