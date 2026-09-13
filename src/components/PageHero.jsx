export default function PageHero({ image, alt, eyebrow, title, lead }) {
  return (
    <section className="page-hero">
      <img className="page-hero__image" src={image} alt={alt} />
      <div className="page-hero__overlay" />
      <div className="container page-hero__content">
        {eyebrow && <span className="eyebrow eyebrow--light">{eyebrow}</span>}
        <h1 className="page-hero__title">{title}</h1>
        {lead && <p className="page-hero__lead">{lead}</p>}
      </div>
    </section>
  );
}
