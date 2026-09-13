import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import { money } from '../utils/format.js';

export default function ExperienceCard({ item, type }) {
  const detailPath = `${type === 'hike' ? '/hikes' : '/tours'}/${item.id}`;

  return (
    <article className="experience-card">
      <Link to={detailPath} className="experience-card__media">
        <img src={item.image} alt={item.imageAlt || item.name} loading="lazy" />
        <span className="tag tag-light experience-card__area">{item.area}</span>
      </Link>
      <div className="experience-card__body">
        <h3 className="experience-card__title">
          <Link to={detailPath}>{item.name}</Link>
        </h3>
        <p className="experience-card__blurb">{item.blurb}</p>
        <ul className="experience-card__facts">
          <li><Icon name="clock" size={15} />{item.duration}</li>
          <li><Icon name="map" size={15} />{item.distance}</li>
          <li><Icon name="mountain" size={15} />{item.difficulty}</li>
        </ul>
        <div className="experience-card__footer">
          <span className="price">
            {money(item.price)}
            <span className="price__unit">per person</span>
          </span>
          <Link to={`/book/${type}/${item.id}`} className="btn btn-primary btn-sm" aria-label={`Book ${item.name}`}>
            Book
          </Link>
        </div>
      </div>
    </article>
  );
}
