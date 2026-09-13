import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api.js';
import { formatDays, money } from '../utils/format.js';
import Icon from './Icon.jsx';
import PageHero from './PageHero.jsx';

const NOTES = {
  hike: [
    'Your guide, permits, water and something to eat at the top are included.',
    'Groups are capped at eight guests, with two guides on anything strenuous.',
    'We confirm by email with the meeting point, a kit list and the weather call.',
  ],
  tour: [
    'A relaxed pace with a local guide and a story at every stop.',
    'Groups are capped at eight guests.',
    'We confirm by email with the meeting point and everything you need to know.',
  ],
};

export default function DetailPage({ type }) {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (type === 'hike' ? api.getHike(id) : api.getTour(id))
      .then(data => { setItem(data); setLoading(false); })
      .catch(() => { setItem(null); setLoading(false); });
  }, [id, type]);

  const listPath = type === 'hike' ? '/hikes' : '/tours';
  const listLabel = type === 'hike' ? 'hikes' : 'tours';

  if (loading) return <p className="state state--page">Loading…</p>;

  if (!item) {
    return (
      <section className="section">
        <div className="container narrow text-center">
          <h1>We couldn't find that {type}</h1>
          <p className="lead">It may no longer be running, or the link might be out of date.</p>
          <Link to={listPath} className="btn btn-secondary">Back to {listLabel}</Link>
        </div>
      </section>
    );
  }

  const facts = [
    { icon: 'clock', label: 'Duration', value: item.duration },
    { icon: 'map', label: 'Distance', value: item.distance },
    { icon: 'trending', label: 'Elevation', value: item.elevation },
    { icon: 'mountain', label: 'Difficulty', value: item.difficulty },
  ];

  return (
    <>
      <PageHero
        image={item.image}
        alt={item.imageAlt || item.name}
        eyebrow={`${item.area} · Guided ${type}`}
        title={item.name}
        lead={item.blurb}
      />

      <section className="section">
        <div className="container detail-layout">
          <div>
            <Link to={listPath} className="back-link">
              <Icon name="arrow-left" size={16} /> All {listLabel}
            </Link>

            <ul className="fact-grid">
              {facts.map(fact => (
                <li key={fact.label} className="fact">
                  <Icon name={fact.icon} size={20} />
                  <span className="fact__label">{fact.label}</span>
                  <span className="fact__value">{fact.value}</span>
                </li>
              ))}
            </ul>

            <h2 className="detail-heading">About this {type}</h2>
            <p className="detail-copy">{item.description}</p>

            <h2 className="detail-heading">Good to know</h2>
            <ul className="checklist">
              {NOTES[type].map(note => (
                <li key={note}><Icon name="check" size={18} />{note}</li>
              ))}
            </ul>
          </div>

          <aside className="booking-card" aria-label="Book this experience">
            <div className="booking-card__price">
              <span className="price price--lg">{money(item.price)}</span>
              <span className="price__unit">per person</span>
            </div>
            <dl className="booking-card__list">
              <div><dt>Runs on</dt><dd>{formatDays(item.daysOfWeek)}</dd></div>
              <div><dt>Start times</dt><dd>{(item.timeSlots || ['08:00', '10:00']).join(' · ')}</dd></div>
              <div><dt>Group size</dt><dd>Up to 8 guests</dd></div>
            </dl>
            <Link to={`/book/${type}/${item.id}`} className="btn btn-primary btn-lg btn-block">
              Check availability
            </Link>
            <p className="booking-card__note">
              Nothing is charged now — we confirm your date first and send a payment link.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
