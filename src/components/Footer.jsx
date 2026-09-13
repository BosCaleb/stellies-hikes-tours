import { Link } from 'react-router-dom';
import { regions } from '../data/regions.js';
import Icon from './Icon.jsx';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div>
          <Link to="/" className="brand">
            <span className="brand__mark"><Icon name="mountain" size={20} /></span>
            <span className="brand__text">
              <span className="brand__name">Stellenbosch Adventures</span>
              <span className="brand__tagline">Hikes &amp; Tours · Cape Winelands</span>
            </span>
          </Link>
          <p className="site-footer__about">
            Guided hikes and tours in Stellenbosch, Pniel, Paarl and Franschhoek — small groups, local guides
            and memorable mountain days.
          </p>
        </div>

        <nav aria-label="Explore">
          <h2 className="site-footer__heading">Explore</h2>
          <ul className="site-footer__list">
            <li><Link to="/hikes">Hikes</Link></li>
            <li><Link to="/tours">Tours</Link></li>
            <li><Link to="/about">Our Story</Link></li>
            <li><Link to="/book">Book a walk</Link></li>
          </ul>
        </nav>

        <nav aria-label="Areas">
          <h2 className="site-footer__heading">Areas</h2>
          <ul className="site-footer__list">
            {regions.map(region => (
              <li key={region.name}><Link to={region.to}>{region.name}</Link></li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="site-footer__heading">Say hello</h2>
          <ul className="site-footer__list site-footer__contact">
            <li>
              <Icon name="mail" size={16} />
              <a href="mailto:hello@stellenboschadventures.co.za">hello@stellenboschadventures.co.za</a>
            </li>
            <li>
              <Icon name="phone" size={16} />
              <a href="tel:+27210000000">+27 21 000 0000</a>
            </li>
            <li>
              <Icon name="pin" size={16} />
              <span>Main Road, Pniel, 7681</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="container site-footer__bottom">
        <span>© {year} Stellenbosch Adventures and Tours</span>
        <Link to="/credits">Photo credits</Link>
      </div>
    </footer>
  );
}
