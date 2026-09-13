import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import PageHero from './PageHero.jsx';

const VALUES = [
  { icon: 'users', title: 'Small groups, always', text: 'Eight guests maximum, two guides on anything strenuous.' },
  { icon: 'pin', title: 'Paid-up locals', text: 'Every guide is from Pniel, Kylemore or Stellenbosch, and gets a full share of the tip.' },
  { icon: 'leaf', title: 'Fynbos first', text: 'We walk on-path, carry out what we carry in, and pay a levy per hiker to the local conservancy.' },
];

export default function About() {
  return (
    <>
      <PageHero
        image="/images/mountains/groot-drakenstein.jpg"
        alt="The Groot Drakenstein mountains between Pniel and Franschhoek"
        eyebrow="Our story · Since 2014"
        title="Three generations of walking the same mountains."
      />

      <section className="section">
        <div className="container split">
          <div>
            <span className="eyebrow">How it started</span>
            <h2>A Sunday walk that never stopped</h2>
            <p className="lead">
              Stellenbosch Adventures and Tours started with a father walking his kids up to the Pniel forest on
              Sunday afternoons, and guests from the guesthouse next door asking to come along. Twelve years later
              it's still the same walk, the same rusks, and mostly the same family.
            </p>
            <p className="about-copy">
              We guide in English, Afrikaans and isiXhosa. Our guides are locals who know the farms, the fire
              seasons and which path turns to mud after rain — and we keep groups small enough that nobody walks
              alone at the back.
            </p>
            <Link to="/book" className="btn btn-primary btn-lg">Book a walk</Link>
          </div>
          <div className="split__media">
            <img
              src="/images/mountains/area-pniel.jpg"
              alt="The Simonsberg towering over the farms of Kylemore and Pniel"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="section section--muted">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">What we stand for</span>
              <h2>How we guide</h2>
            </div>
          </div>
          <div className="card-grid">
            {VALUES.map(value => (
              <div key={value.title} className="card">
                <span className="feature__icon"><Icon name={value.icon} size={20} /></span>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
