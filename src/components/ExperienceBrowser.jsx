import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ExperienceCard from './ExperienceCard.jsx';
import FilterChips from './FilterChips.jsx';
import PageHero from './PageHero.jsx';

const DIFFICULTIES = ['All', 'Easy', 'Moderate', 'Strenuous'];

/**
 * Shared list page for hikes and tours. Filters live in the URL (?area=&difficulty=)
 * so the home page area cards and footer links can deep-link into a filtered list.
 */
export default function ExperienceBrowser({ type, noun, load, hero, showDifficulty = false }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [params, setParams] = useSearchParams();
  const area = params.get('area') || 'All';
  const difficulty = params.get('difficulty') || 'All';

  useEffect(() => {
    load()
      .then(data => { setItems(data); setStatus('ready'); })
      .catch(() => setStatus('error'));
  }, [load]);

  const areas = useMemo(() => ['All', ...new Set(items.map(item => item.area))], [items]);

  // "Easy–moderate" counts as Easy, matching the original difficulty filter.
  const visible = items.filter(item =>
    (area === 'All' || item.area === area) &&
    (difficulty === 'All' || item.difficulty.toLowerCase().startsWith(difficulty.toLowerCase()))
  );

  function setFilter(key, value) {
    const next = new URLSearchParams(params);
    if (value === 'All') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  }

  return (
    <>
      <PageHero {...hero} />
      <section className="section section--tight">
        <div className="container">
          <div className="filter-bar">
            <FilterChips label="Area" options={areas} value={area} onChange={value => setFilter('area', value)} />
            {showDifficulty && (
              <FilterChips label="Difficulty" options={DIFFICULTIES} value={difficulty} onChange={value => setFilter('difficulty', value)} />
            )}
            {status === 'ready' && (
              <p className="filter-bar__count">{visible.length} {visible.length === 1 ? noun : `${noun}s`}</p>
            )}
          </div>

          {status === 'loading' && <p className="state">Loading {noun}s…</p>}
          {status === 'error' && (
            <p className="state state--error">We couldn't load {noun}s right now. Please try again shortly.</p>
          )}
          {status === 'ready' && visible.length > 0 && (
            <div className="experience-grid">
              {visible.map(item => <ExperienceCard key={item.id} item={item} type={type} />)}
            </div>
          )}
          {status === 'ready' && visible.length === 0 && (
            <div className="empty-state">
              <p>No {noun}s match those filters.</p>
              <button type="button" className="btn btn-secondary" onClick={() => setParams({}, { replace: true })}>
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
