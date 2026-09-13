import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { regions } from '../data/regions.js';
import ExperienceCard from './ExperienceCard.jsx';
import Icon from './Icon.jsx';

const STATS = [
  { value: '2014', label: 'Guiding since' },
  { value: '8', label: 'Guests per group, max' },
  { value: '4', label: 'Mountain areas' },
  { value: '3', label: 'Languages spoken' },
];

const HIGHLIGHTS = [
  {
    icon: 'users',
    title: 'Eight guests, maximum',
    text: 'Small groups mean real conversation with your guide, and nobody walks alone at the back.',
  },
  {
    icon: 'pin',
    title: 'Guides who grew up here',
    text: 'Our guides are from Pniel, Kylemore and Stellenbosch, and know the farms, the fire seasons and the paths.',
  },
  {
    icon: 'leaf',
    title: 'Fynbos first',
    text: 'We walk on-path, carry out what we carry in, and pay a conservation levy for every hiker.',
  },
];

const PACES = [
  {
    title: 'Easy walks',
    text: 'Shorter routes and gentle gradients for families, first-timers and a relaxed Winelands morning.',
    to: '/hikes?difficulty=Easy',
    cta: 'See easy walks',
  },
  {
    title: 'Moderate climbs',
    text: 'Half-day routes with a proper climb through fynbos and a big valley view as the reward.',
    to: '/hikes?difficulty=Moderate',
    cta: 'See moderate hikes',
  },
  {
    title: 'Strenuous days',
    text: 'Full-day summits and traverses at a measured pace for hikers who want the challenge without the crowd.',
    to: '/hikes?difficulty=Strenuous',
    cta: 'See strenuous hikes',
  },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    Promise.all([api.getHikes(), api.getTours()])
      .then(([hikes, tours]) => {
        setFeatured([
          ...hikes.slice(0, 2).map(item => ({ item, type: 'hike' })),
          ...tours.slice(0, 1).map(item => ({ item, type: 'tour' })),
        ]);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <>
      <section className="hero">
        <img
          className="hero__image"
          src="/images/mountains/hero-franschhoek-valley.jpg"
          alt="The Franschhoek valley surrounded by mountains in the Cape Winelands"
        />
        <div className="hero__overlay" />
        <div className="container hero__content">
          <span className="eyebrow eyebrow--light">Pniel · Stellenbosch · Paarl · Franschhoek</span>
          <h1 className="hero__title">Walk the mountains we know by heart.</h1>
          <p className="hero__lead">
            Small-group guided hikes and tours through the Cape Winelands: granite domes, fynbos ridges
            and valley views from the best seats in the Boland.
          </p>
          <div className="hero__actions">
            <Link to="/book" className="btn btn-light btn-lg">
              Book a walk <Icon name="arrow-right" />
            </Link>
            <Link to="/hikes" className="btn btn-outline-light btn-lg">Explore hikes</Link>
          </div>
        </div>
        <div className="container">
          <ul className="hero__stats">
            {STATS.map(stat => (
              <li key={stat.label} className="hero__stat">
                <span className="hero__stat-value">{stat.value}</span>
                <span className="hero__stat-label">{stat.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Where we walk</span>
              <h2>Four mountain areas, one local team</h2>
              <p className="lead">
                Small-group routes across the Boland, from Jonkershoek's peaks to the granite domes above Paarl.
              </p>
            </div>
          </div>
          <div className="region-grid">
            {regions.map(region => (
              <Link key={region.name} to={region.to} className="region-card">
                <img src={region.image} alt={region.alt} loading="lazy" />
                <div className="region-card__body">
                  <h3 className="region-card__name">{region.name}</h3>
                  <p className="region-card__blurb">{region.blurb}</p>
                  <span className="region-card__link">
                    {region.linkLabel} <Icon name="arrow-right" size={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--muted">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Popular experiences</span>
              <h2>Good places to start</h2>
            </div>
            <Link to="/hikes" className="link-arrow">
              View all hikes <Icon name="arrow-right" size={16} />
            </Link>
          </div>
          {status === 'loading' && <p className="state">Loading experiences…</p>}
          {status === 'error' && (
            <p className="state state--error">We couldn't load experiences right now. Please try again shortly.</p>
          )}
          {status === 'ready' && (
            <div className="experience-grid">
              {featured.map(({ item, type }) => (
                <ExperienceCard key={`${type}-${item.id}`} item={item} type={type} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div className="split__media">
            <img
              src="/images/mountains/franschhoek-plateau.jpg"
              alt="Fynbos on the plateau of Franschhoek's Mont Rochelle Nature Reserve"
              loading="lazy"
            />
          </div>
          <div>
            <span className="eyebrow">Why travellers book with us</span>
            <h2>A local way to experience the Boland</h2>
            <p className="lead">
              We keep things personal: early starts, warm coffee, proper mountain routes and a guide who knows
              exactly where to stop for a view, a story and a good lunch spot.
            </p>
            <ul className="feature-list">
              {HIGHLIGHTS.map(highlight => (
                <li key={highlight.title} className="feature">
                  <span className="feature__icon"><Icon name={highlight.icon} size={20} /></span>
                  <div>
                    <h3 className="feature__title">{highlight.title}</h3>
                    <p className="feature__text">{highlight.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/about" className="btn btn-secondary">Our story</Link>
          </div>
        </div>
      </section>

      <section className="section section--muted">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Find your pace</span>
              <h2>Walks for every kind of walker</h2>
            </div>
          </div>
          <div className="card-grid">
            {PACES.map(pace => (
              <div key={pace.title} className="card">
                <h3>{pace.title}</h3>
                <p>{pace.text}</p>
                <Link to={pace.to} className="link-arrow">
                  {pace.cta} <Icon name="arrow-right" size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <img src="/images/mountains/simonsberg-sunset.jpg" alt="" loading="lazy" />
        <div className="container cta-band__inner">
          <div>
            <h2>Ready for a mountain morning?</h2>
            <p>Pick a route, choose a date and we'll confirm your spot with the meeting point and a simple kit list.</p>
          </div>
          <div className="cta-band__actions">
            <Link to="/book" className="btn btn-light btn-lg">Book a walk</Link>
            <Link to="/tours" className="btn btn-outline-light btn-lg">Browse tours</Link>
          </div>
        </div>
      </section>
    </>
  );
}
