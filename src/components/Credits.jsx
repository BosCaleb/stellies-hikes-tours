import credits from '../data/imageCredits.json';

export default function Credits() {
  return (
    <section className="section">
      <div className="container narrow">
        <span className="eyebrow">Photography</span>
        <h1>Photo credits</h1>
        <p className="lead">
          The mountain photography on this site comes from Wikimedia Commons and is used under Creative Commons
          licences. Images have been resized for the web. Thank you to the photographers below.
        </p>
        <ul className="credit-list">
          {credits.map(credit => (
            <li key={credit.file} className="credit">
              <img className="credit__thumb" src={credit.file} alt="" loading="lazy" />
              <div>
                <a className="credit__title" href={credit.source} target="_blank" rel="noopener noreferrer">
                  {credit.title}
                </a>
                <p className="credit__meta">
                  {credit.author} ·{' '}
                  {credit.licenseUrl ? (
                    <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer">{credit.license}</a>
                  ) : (
                    credit.license
                  )}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
