import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Icon from './Icon.jsx';

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/hikes', label: 'Hikes' },
  { to: '/tours', label: 'Tours' },
  { to: '/about', label: 'Our Story' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the mobile menu after navigating.
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="brand">
          <span className="brand__mark"><Icon name="mountain" size={20} /></span>
          <span className="brand__text">
            <span className="brand__name">Stellenbosch Adventures</span>
            <span className="brand__tagline">Hikes &amp; Tours · Cape Winelands</span>
          </span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen(isOpen => !isOpen)}
        >
          <Icon name={open ? 'x' : 'menu'} size={22} />
          <span className="visually-hidden">{open ? 'Close menu' : 'Open menu'}</span>
        </button>

        <nav id="site-nav" className={`site-nav${open ? ' is-open' : ''}`} aria-label="Main">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `site-nav__link${isActive ? ' is-active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
          <Link to="/book" className="btn btn-primary site-nav__cta">Book a walk</Link>
        </nav>
      </div>
    </header>
  );
}
