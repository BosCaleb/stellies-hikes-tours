const { useState, useEffect, useRef, useCallback } = React;
const { createRoot } = ReactDOM;

// ─── API helpers ───
const API = '/api';
async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
const api = {
  getHikes: () => fetchJson(`${API}/hikes`),
  getHike: (id) => fetchJson(`${API}/hikes/${id}`),
  getTours: () => fetchJson(`${API}/tours`),
  getTour: (id) => fetchJson(`${API}/tours/${id}`),
  getAvailability: (type, id) => fetchJson(`${API}/availability/${type}/${id}`),
  createBooking: (b) => postJson(`${API}/bookings`, b),
};

function money(n) { return 'R' + n.toLocaleString('en-ZA'); }

// ─── Hash router ───
function useHashRoute() {
  const [route, setRoute] = useState(() => parseHash());
  useEffect(() => {
    const onHash = () => { setRoute(parseHash()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
}
function parseHash() {
  const hash = window.location.hash.slice(1) || '/';
  const parts = hash.split('/').filter(Boolean); // e.g. ['hikes', 'pniel-sunrise']
  return { path: hash, parts };
}
function navigate(to) {
  window.location.hash = to;
}

// ─── Vue Calendar wrapper (React → Vue bridge) ───
function VueCalendar({ availability, onSelected }) {
  const containerRef = useRef(null);
  const vueAppRef = useRef(null);
  const cbRef = useRef(onSelected);
  cbRef.current = onSelected;

  // Mount/unmount on availability change
  useEffect(() => {
    if (!containerRef.current) return;
    // Cleanup previous
    if (vueAppRef.current) { vueAppRef.current.unmount(); vueAppRef.current = null; }
    const app = window.VueCreateApp(window.BookingCalendar, {
      availability,
      onSelected: (val) => cbRef.current?.(val),
    });
    app.mount(containerRef.current);
    vueAppRef.current = app;
    return () => { if (vueAppRef.current) { vueAppRef.current.unmount(); vueAppRef.current = null; } };
  }, [availability]);

  return React.createElement('div', { ref: containerRef });
}

// ─── Header ───
function Header({ route }) {
  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/hikes', label: 'Hikes' },
    { to: '/tours', label: 'Tours' },
    { to: '/about', label: 'Our Story' },
  ];
  const current = '/' + (route.parts[0] || '');
  return React.createElement('header', {
    style: {
      position: 'sticky', top: 0, zIndex: 20,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 24, padding: '16px 40px',
      background: 'color-mix(in srgb, var(--color-bg) 92%, transparent)',
      backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--color-divider)',
    },
  },
    React.createElement('a', {
      href: '#/', style: { display: 'flex', alignItems: 'center', gap: 12, color: 'var(--color-text)', textDecoration: 'none' },
    },
      React.createElement('span', {
        style: {
          display: 'grid', placeItems: 'center', width: 42, height: 42,
          borderRadius: '999px', background: 'var(--color-accent-2-500)',
          color: 'var(--color-neutral-100)', fontFamily: 'var(--font-heading)', fontSize: 19, lineHeight: 1,
        },
      }, 'S'),
      React.createElement('span', { style: { display: 'flex', flexDirection: 'column', lineHeight: 1.15 } },
        React.createElement('span', { style: { fontFamily: 'var(--font-heading)', fontSize: 19 } }, 'Stellenbosch Adventures'),
        React.createElement('span', { style: { fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' } }, 'and Tours'),
      ),
    ),
    React.createElement('nav', { className: 'header-nav', style: { display: 'flex', alignItems: 'center', gap: 6 } },
      ...navItems.map(item => {
        const active = current === item.to || (item.to !== '/' && current.startsWith(item.to));
        return React.createElement('a', {
          key: item.to, href: '#' + item.to,
          style: {
            padding: '9px 16px', borderRadius: '999px', fontSize: 15,
            fontWeight: active ? 700 : 500, textDecoration: 'none',
            color: active ? 'var(--color-accent-700)' : 'var(--color-text)',
            background: active ? 'var(--color-accent-100)' : 'transparent',
          },
        }, item.label);
      }),
      React.createElement('a', {
        href: '#/book', className: 'btn btn-primary',
        style: { marginLeft: 10, padding: '10px 22px', fontSize: 15, textDecoration: 'none' },
      }, 'Book a Walk'),
    ),
  );
}

// ─── Footer ───
function Footer() {
  return React.createElement('footer', {
    style: { background: 'var(--color-neutral-900)', color: 'var(--color-neutral-200)', padding: '56px 40px 40px' },
  },
    React.createElement('div', {
      className: 'footer-grid', style: { display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 40, maxWidth: 1240, margin: '0 auto' },
    },
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
        React.createElement('span', { style: { fontFamily: 'var(--font-heading)', fontSize: 24, color: 'var(--color-neutral-100)' } }, 'Stellenbosch Adventures and Tours'),
        React.createElement('p', { style: { margin: 0, maxWidth: '38ch', fontSize: 15, lineHeight: 1.65, color: 'var(--color-neutral-400)' } },
          'Guided hiking and tours in Pniel, Paarl and Stellenbosch. Rain or shine — mostly shine.'),
      ),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10, fontSize: 15 } },
        React.createElement('span', { style: { fontSize: 13, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-neutral-500)' } }, 'Explore'),
        ...['Hikes|/hikes', 'Tours|/tours', 'Our Story|/about', 'Book a Walk|/book'].map(s => {
          const [label, to] = s.split('|');
          return React.createElement('a', { key: to, href: '#' + to, style: { color: 'var(--color-neutral-200)', textDecoration: 'none' } }, label);
        }),
      ),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10, fontSize: 15, color: 'var(--color-neutral-300)' } },
        React.createElement('span', { style: { fontSize: 13, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-neutral-500)' } }, 'Say Hello'),
        React.createElement('span', null, 'hello@stellenboschadventures.co.za'),
        React.createElement('span', null, '+27 21 000 0000'),
        React.createElement('span', null, 'Main Road, Pniel, 7681'),
      ),
    ),
  );
}

// ─── Home ───
function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([api.getHikes(), api.getTours()])
      .then(([hikes, tours]) => { setFeatured([...hikes.slice(0, 2), ...tours.slice(0, 1)]); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return React.createElement(React.Fragment, null,
    // Hero
    React.createElement('section', {
      className: 'hero-grid', style: { display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 56, alignItems: 'center', padding: '76px 40px 64px', maxWidth: 1240, margin: '0 auto' },
    },
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 24 } },
        React.createElement('span', { className: 'tag tag-accent-2', style: { padding: '7px 16px' } }, 'Pniel · Paarl · Stellenbosch'),
        React.createElement('h1', { style: { margin: 0, fontSize: 66, lineHeight: 1.03, letterSpacing: '-.5px', maxWidth: '11ch' } }, 'Walk the mountains we grew up on.'),
        React.createElement('p', { style: { margin: 0, maxWidth: '46ch', fontSize: 19, lineHeight: 1.65, color: 'var(--color-neutral-700)' } },
          'Small guided hikes and tours through the Boland — granite domes above Paarl, fynbos ridges over Pniel, and the long green valleys behind Stellenbosch. Coffee at the start, a story at the top, and you\'re home by supper.'),
        React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 12, paddingTop: 6 } },
          React.createElement('a', { href: '#/book', className: 'btn btn-primary btn-lg', style: { textDecoration: 'none' } }, 'Book a Walk'),
          React.createElement('a', { href: '#/hikes', className: 'btn btn-secondary btn-lg', style: { textDecoration: 'none' } }, 'See all hikes'),
        ),
        React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 28, paddingTop: 18, fontSize: 14, color: 'var(--color-neutral-600)' } },
          React.createElement('span', null, 'Groups of 8 or fewer'),
          React.createElement('span', null, 'Family & kid-friendly routes'),
          React.createElement('span', null, 'Pickup in Stellenbosch'),
        ),
      ),
      React.createElement('div', { style: { position: 'relative' } },
        React.createElement('div', { style: { position: 'absolute', left: -38, bottom: -26, width: 150, height: 150, borderRadius: '999px', background: 'var(--color-accent-2-200)' } }),
        React.createElement('div', { className: 'washed', style: { position: 'relative', overflow: 'hidden', borderRadius: '220px 220px 28px 28px', boxShadow: 'var(--shadow-lg)' } },
          React.createElement('img', { src: 'https://media.base44.com/images/public/6a9fb26545281f1567456df2/ab65ed0bb_Simonsberg.jpg', alt: 'Simonsberg mountain peaks under a bright sky', style: { width: '100%', height: 520, objectFit: 'cover' } }),
        ),
      ),
    ),
    // Featured
    React.createElement('section', { style: { padding: '16px 40px 84px', maxWidth: 1240, margin: '0 auto' } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, paddingBottom: 28 } },
        React.createElement('h2', { style: { margin: 0, fontSize: 40 } }, 'Three good places to start'),
        React.createElement('a', { href: '#/hikes', className: 'btn btn-ghost', style: { fontSize: 16, textDecoration: 'none' } }, 'All hikes and tours →'),
      ),
      React.createElement('div', { className: 'grid-3' },
        loading
          ? React.createElement('p', { style: { color: 'var(--color-neutral-600)' } }, 'Loading…')
          : featured.map(item => React.createElement(FeatureCard, { key: item.id, item })),
      ),
    ),
    // About teaser
    React.createElement('section', { style: { background: 'var(--color-surface)', padding: '78px 40px' } },
      React.createElement('div', { className: 'about-teaser-grid', style: { display: 'grid', gridTemplateColumns: '.9fr 1.1fr', gap: 56, alignItems: 'center', maxWidth: 1240, margin: '0 auto' } },
        React.createElement('div', { className: 'washed', style: { overflow: 'hidden', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' } },
          React.createElement('img', { src: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8786?auto=format&fit=crop&w=800&q=80', alt: 'Valley view', style: { width: '100%', height: 380, objectFit: 'cover' } }),
        ),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 20 } },
          React.createElement('h2', { style: { margin: 0, fontSize: 42, lineHeight: 1.1, maxWidth: '16ch' } }, 'A valley that feels like a kitchen table.'),
          React.createElement('p', { style: { margin: 0, maxWidth: '52ch', fontSize: 17, lineHeight: 1.7, color: 'var(--color-neutral-700)' } },
            'We\'re a family outfit from Pniel. Everyone who walks with us gets the same thing: a slow start, a guide who knows which farm road to take, rusks halfway, and time to sit at the top instead of rushing the descent.'),
          React.createElement('a', { href: '#/about', className: 'btn btn-secondary', style: { padding: '12px 24px', textDecoration: 'none' } }, 'Our story'),
        ),
      ),
    ),
    // Who we walk with
    React.createElement('section', { style: { padding: '78px 40px', maxWidth: 1240, margin: '0 auto' } },
      React.createElement('h2', { style: { margin: '0 0 30px', fontSize: 40 } }, 'Who we walk with'),
      React.createElement('div', { className: 'grid-3' },
        ...['Visiting the Winelands|Half-day walks that end at a farm table. We handle transfers from your guesthouse and the tasting booking after.',
          'Families with kids|Short, shaded routes with real things to find — waterfalls, tortoises, a picnic spot. Prams stay in the car; small legs are welcome.',
          'Hikers after a hard day|Full traverses with 1 200 m of climbing, early starts and no shuttle bail-out. Bring 3 litres and decent boots.'
        ].map(s => {
          const [title, body] = s.split('|');
          return React.createElement('div', { key: title, className: 'card', style: { gap: 10, padding: 30 } },
            React.createElement('h3', { style: { margin: 0, fontSize: 22 } }, title),
            React.createElement('p', { style: { margin: 0, fontSize: 15, lineHeight: 1.65, color: 'var(--color-neutral-700)' } }, body),
          );
        }),
      ),
    ),
  );
}

function FeatureCard({ item }) {
  const type = item.daysOfWeek ? 'hike' : 'tour';
  return React.createElement('article', { className: 'card elev-sm', style: { padding: 0, overflow: 'hidden', gap: 0 } },
    React.createElement('div', { className: 'washed', style: { height: 196, overflow: 'hidden' } },
      React.createElement('img', { src: item.image, alt: item.name, style: { width: '100%', height: '100%', objectFit: 'cover' } }),
    ),
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 12, padding: '24px 26px 26px' } },
      React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8 } },
        React.createElement('span', { className: 'tag tag-outline' }, item.difficulty),
        React.createElement('span', { className: 'tag tag-neutral' }, item.duration),
      ),
      React.createElement('h3', { style: { margin: 0, fontSize: 24, lineHeight: 1.2 } }, item.name),
      React.createElement('p', { style: { margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--color-neutral-700)' } }, item.blurb),
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 8 } },
        React.createElement('span', { style: { fontSize: 15, color: 'var(--color-neutral-600)' } }, money(item.price) + ' pp'),
        React.createElement('a', { href: '#/book/' + type + '/' + item.id, className: 'btn btn-secondary', style: { padding: '9px 18px', fontSize: 14, textDecoration: 'none' } }, 'Book'),
      ),
    ),
  );
}

// ─── Hikes List ───
function HikesList() {
  const [hikes, setHikes] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.getHikes().then(h => { setHikes(h); setLoading(false); }).catch(() => setLoading(false)); }, []);
  const filters = ['All', 'Easy', 'Moderate', 'Strenuous'];
  const matches = h => filter === 'All' || h.difficulty.toLowerCase().startsWith(filter.toLowerCase());
  const visible = hikes.filter(matches);

  return React.createElement('div', { style: { padding: '64px 40px 84px', maxWidth: 1240, margin: '0 auto' } },
    React.createElement('h1', { style: { margin: '0 0 14px', fontSize: 54 } }, 'Hikes'),
    React.createElement('p', { style: { margin: '0 0 30px', maxWidth: '58ch', fontSize: 18, lineHeight: 1.65, color: 'var(--color-neutral-700)' } },
      'Every walk runs with eight people or fewer. Prices are per person and include a guide, permits, water and something to eat at the top.'),
    React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 10, paddingBottom: 34 } },
      ...filters.map(label => React.createElement('button', {
        key: label, onClick: () => setFilter(label), className: 'btn',
        style: {
          padding: '9px 20px', borderRadius: '999px', fontSize: 15,
          border: `1px solid ${filter === label ? 'var(--color-accent)' : 'var(--color-divider)'}`,
          background: filter === label ? 'var(--color-accent)' : 'transparent',
          color: filter === label ? 'var(--color-bg)' : 'var(--color-neutral-700)',
        },
      }, label)),
    ),
    loading
      ? React.createElement('p', { style: { color: 'var(--color-neutral-600)' } }, 'Loading hikes…')
      : React.createElement('div', { className: 'grid-2' }, visible.map(h => React.createElement(ItemCard, { key: h.id, item: h, type: 'hike' }))),
  );
}

// ─── Tours List ───
function ToursList() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.getTours().then(t => { setTours(t); setLoading(false); }).catch(() => setLoading(false)); }, []);
  return React.createElement('div', { style: { padding: '64px 40px 84px', maxWidth: 1240, margin: '0 auto' } },
    React.createElement('h1', { style: { margin: '0 0 14px', fontSize: 54 } }, 'Tours'),
    React.createElement('p', { style: { margin: '0 0 30px', maxWidth: '58ch', fontSize: 18, lineHeight: 1.65, color: 'var(--color-neutral-700)' } },
      'Guided cultural, wine and nature tours through the Cape Winelands. Relaxed pace, local guides, and a story at every stop.'),
    loading
      ? React.createElement('p', { style: { color: 'var(--color-neutral-600)' } }, 'Loading tours…')
      : React.createElement('div', { className: 'grid-2' }, tours.map(t => React.createElement(ItemCard, { key: t.id, item: t, type: 'tour' }))),
  );
}

function ItemCard({ item, type }) {
  return React.createElement('article', { className: 'card elev-sm item-card-grid', style: { padding: 0, overflow: 'hidden', gap: 0, display: 'grid', gridTemplateColumns: '200px 1fr' } },
    React.createElement('div', { className: 'washed', style: { height: '100%', minHeight: 220, overflow: 'hidden' } },
      React.createElement('img', { src: item.image, alt: item.name, style: { width: '100%', height: '100%', objectFit: 'cover' } }),
    ),
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 12, padding: '26px 28px' } },
      React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8 } },
        React.createElement('span', { className: 'tag tag-outline' }, item.difficulty),
        React.createElement('span', { className: 'tag tag-neutral' }, item.duration),
        React.createElement('span', { className: 'tag tag-accent-2' }, item.area),
      ),
      React.createElement('h3', { style: { margin: 0, fontSize: 26, lineHeight: 1.15 } }, item.name),
      React.createElement('p', { style: { margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--color-neutral-700)' } }, item.blurb),
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 'auto', paddingTop: 12 } },
        React.createElement('span', { style: { fontSize: 16, color: 'var(--color-neutral-700)' } }, money(item.price) + ' pp'),
        React.createElement('div', { style: { display: 'flex', gap: 8 } },
          React.createElement('a', { href: '#/' + (type === 'hike' ? 'hikes' : 'tours') + '/' + item.id, className: 'btn btn-secondary', style: { padding: '10px 20px', fontSize: 14, textDecoration: 'none' } }, 'Details'),
          React.createElement('a', { href: '#/book/' + type + '/' + item.id, className: 'btn btn-primary', style: { padding: '10px 20px', fontSize: 14, textDecoration: 'none' } }, 'Book'),
        ),
      ),
    ),
  );
}

// ─── Detail Page ───
function DetailPage({ type, id }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    (type === 'hike' ? api.getHike(id) : api.getTour(id))
      .then(d => { setItem(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id, type]);

  if (loading) return React.createElement('div', { style: { padding: 64, textAlign: 'center', color: 'var(--color-neutral-600)' } }, 'Loading…');
  if (!item) return React.createElement('div', { style: { padding: '64px 40px', maxWidth: 800, margin: '0 auto', textAlign: 'center' } },
    React.createElement('h1', null, 'Not found'),
    React.createElement('a', { href: '#/' + (type === 'hike' ? 'hikes' : 'tours'), className: 'btn btn-secondary' }, 'Back'),
  );

  return React.createElement('div', { style: { padding: '64px 40px 84px', maxWidth: 1080, margin: '0 auto' } },
    React.createElement('div', { style: { marginBottom: 20 } },
      React.createElement('a', { href: '#/' + (type === 'hike' ? 'hikes' : 'tours'), className: 'btn btn-ghost', style: { fontSize: 15, textDecoration: 'none' } }, '← Back to ' + (type === 'hike' ? 'hikes' : 'tours')),
    ),
    React.createElement('div', { className: 'washed', style: { overflow: 'hidden', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', marginBottom: 34 } },
      React.createElement('img', { src: item.image, alt: item.name, style: { width: '100%', height: 400, objectFit: 'cover' } }),
    ),
    React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 } },
      React.createElement('span', { className: 'tag tag-outline' }, item.difficulty),
      React.createElement('span', { className: 'tag tag-neutral' }, item.duration),
      React.createElement('span', { className: 'tag tag-accent-2' }, item.area),
    ),
    React.createElement('h1', { style: { margin: '0 0 18px', fontSize: 48 } }, item.name),
    React.createElement('p', { style: { fontSize: 18, lineHeight: 1.7, color: 'var(--color-neutral-700)', maxWidth: '62ch', marginBottom: 30 } }, item.description),
    React.createElement('div', { className: 'stats-grid', style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, padding: '24px 0', borderTop: '1px solid var(--color-divider)', borderBottom: '1px solid var(--color-divider)', marginBottom: 30 } },
      ...[['Distance', item.distance], ['Elevation', item.elevation], ['Duration', item.duration], ['Price', money(item.price) + ' pp']].map(([label, val]) =>
        React.createElement('div', { key: label },
          React.createElement('div', { style: { fontSize: 13, color: 'var(--color-neutral-600)' } }, label),
          React.createElement('div', { style: { fontSize: 17, fontWeight: 600 } }, val),
        ),
      ),
    ),
    React.createElement('div', { style: { display: 'flex', gap: 12, flexWrap: 'wrap' } },
      React.createElement('a', { href: '#/book/' + type + '/' + item.id, className: 'btn btn-primary btn-lg', style: { textDecoration: 'none' } }, 'Book this ' + type),
      React.createElement('a', { href: '#/' + (type === 'hike' ? 'hikes' : 'tours'), className: 'btn btn-secondary btn-lg', style: { textDecoration: 'none' } }, 'See more'),
    ),
  );
}

// ─── About ───
function About() {
  return React.createElement('div', { style: { padding: '64px 40px 84px', maxWidth: 1000, margin: '0 auto' } },
    React.createElement('span', { className: 'tag tag-accent', style: { padding: '7px 16px' } }, 'Since 2014'),
    React.createElement('h1', { style: { margin: '18px 0 22px', fontSize: 54, lineHeight: 1.06, maxWidth: '16ch' } }, 'Three generations of walking the same mountains.'),
    React.createElement('div', { className: 'washed', style: { overflow: 'hidden', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', marginBottom: 38 } },
      React.createElement('img', { src: 'https://images.unsplash.com/photo-1533240332313-0db49b459b8c?auto=format&fit=crop&w=1000&q=80', alt: 'The team', style: { width: '100%', height: 400, objectFit: 'cover' } }),
    ),
    React.createElement('div', { className: 'about-grid', style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 44 } },
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 18 } },
        React.createElement('p', { style: { margin: 0, fontSize: 18, lineHeight: 1.75, color: 'var(--color-neutral-800)' } },
          'Stellenbosch Adventures and Tours started with a father walking his kids up to the Pniel forest on Sunday afternoons, and guests from the guesthouse next door asking to come along. Twelve years later it\'s still the same walk, the same rusks, and mostly the same family.'),
        React.createElement('p', { style: { margin: 0, fontSize: 17, lineHeight: 1.75, color: 'var(--color-neutral-700)' } },
          'We guide in English, Afrikaans and isiXhosa. Our guides are locals who know the farms, the fire seasons and which path turns to mud after rain — and we keep groups small enough that nobody walks alone at the back.'),
        React.createElement('a', { href: '#/book', className: 'btn btn-primary', style: { padding: '12px 24px', marginTop: 8, textDecoration: 'none' } }, 'Book a walk'),
      ),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 16 } },
        ...['Small groups, always|Eight guests maximum, two guides on anything strenuous.',
          'Paid-up locals|Every guide is from Pniel, Kylemore or Stellenbosch, and gets a full share of the tip.',
          'Fynbos first|We walk on-path, carry out what we carry in, and pay a levy per hiker to the local conservancy.'
        ].map(s => {
          const [title, body] = s.split('|');
          return React.createElement('div', { key: title, className: 'card', style: { gap: 8, padding: 26 } },
            React.createElement('h3', { style: { margin: 0, fontSize: 20 } }, title),
            React.createElement('p', { style: { margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--color-neutral-700)' } }, body),
          );
        }),
      ),
    ),
  );
}

// ─── Booking Page (cal.diy-inspired) ───
function BookingPage({ preType, preId }) {
  const [hikes, setHikes] = useState([]);
  const [tours, setTours] = useState([]);
  const [selectedType, setSelectedType] = useState(preType || 'hike');
  const [selectedId, setSelectedId] = useState(preId || '');
  const [availability, setAvailability] = useState({ dates: {} });
  const [selection, setSelection] = useState({ date: null, time: null });
  const [form, setForm] = useState({ name: '', email: '', phone: '', people: 2, notes: '' });
  const [booked, setBooked] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([api.getHikes(), api.getTours()])
      .then(([h, t]) => {
        setHikes(h); setTours(t);
        if (!preId) { setSelectedId(h[0]?.id || ''); setSelectedType('hike'); }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId || !selectedType) return;
    setSelection({ date: null, time: null });
    api.getAvailability(selectedType, selectedId)
      .then(d => setAvailability(d))
      .catch(() => setAvailability({ dates: {} }));
  }, [selectedId, selectedType]);

  const allItems = [...hikes.map(h => ({ ...h, type: 'hike' })), ...tours.map(t => ({ ...t, type: 'tour' }))];
  const selectedItem = allItems.find(i => i.id === selectedId && i.type === selectedType) || allItems[0];
  const people = Math.max(1, Math.min(8, parseInt(form.people) || 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selection.date || !selection.time) { setError('Please pick a date and time.'); return; }
    if (!form.name || !form.email) { setError('Please enter your name and email.'); return; }
    setSubmitting(true);
    try {
      const booking = await api.createBooking({
        type: selectedType, itemId: selectedId,
        date: selection.date, time: selection.time,
        name: form.name, email: form.email, phone: form.phone,
        people: form.people, notes: form.notes,
      });
      setBooked(booking); window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message || 'Booking failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return React.createElement('div', { style: { padding: 64, textAlign: 'center', color: 'var(--color-neutral-600)' } }, 'Loading…');

  if (booked) {
    return React.createElement('div', { style: { padding: '64px 40px 84px', maxWidth: 1080, margin: '0 auto' } },
      React.createElement('div', { className: 'card elev-md', style: { gap: 14, padding: 44, background: 'var(--color-accent-2-100)', borderRadius: 'var(--radius-lg)' } },
        React.createElement('h2', { style: { margin: 0, fontSize: 34 } }, "You're on the mountain list."),
        React.createElement('p', { style: { margin: 0, fontSize: 17, lineHeight: 1.7, color: 'var(--color-neutral-800)', maxWidth: '52ch' } },
          `We've got you down for ${booked.itemName} on ${booked.date} at ${booked.time}, ${booked.people} ${booked.people === 1 ? 'person' : 'people'}. Look out for a note from us within a day — meeting point, kit list and the weather call.`),
        React.createElement('div', { style: { display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 } },
          React.createElement('a', { href: '#/', className: 'btn btn-primary', style: { padding: '12px 24px', textDecoration: 'none' } }, 'Back home'),
          React.createElement('button', { className: 'btn btn-secondary', style: { padding: '12px 24px' }, onClick: () => { setBooked(null); setSelection({ date: null, time: null }); } }, 'Book another walk'),
        ),
      ),
    );
  }

  return React.createElement('div', { style: { padding: '64px 40px 84px', maxWidth: 1080, margin: '0 auto' } },
    React.createElement('h1', { style: { margin: '0 0 12px', fontSize: 52 } }, 'Book a walk'),
    React.createElement('p', { style: { margin: '0 0 34px', maxWidth: '54ch', fontSize: 18, lineHeight: 1.65, color: 'var(--color-neutral-700)' } },
      'Pick a hike or tour, choose a date and time, and we\'ll confirm by email within a day with a meeting point and a kit list.'),
    React.createElement('div', { className: 'booking-grid', style: { display: 'grid', gridTemplateColumns: '1.25fr .75fr', gap: 34, alignItems: 'start' } },
      // Left: Form
      React.createElement('form', { onSubmit: handleSubmit, className: 'card', style: { gap: 20, padding: 34 } },
        // Item selection
        React.createElement('div', { className: 'field' },
          React.createElement('label', null, 'Which hike or tour'),
          React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
            ...hikes.map(h => React.createElement(ItemButton, {
              key: h.id, item: h, type: 'hike',
              active: selectedId === h.id && selectedType === 'hike',
              onClick: () => { setSelectedType('hike'); setSelectedId(h.id); },
            })),
            ...tours.map(t => React.createElement(ItemButton, {
              key: t.id, item: t, type: 'tour',
              active: selectedId === t.id && selectedType === 'tour',
              onClick: () => { setSelectedType('tour'); setSelectedId(t.id); },
            })),
          ),
        ),
        // Vue Calendar
        React.createElement('div', { className: 'field' },
          React.createElement('label', null, 'Pick a date & time'),
          React.createElement('div', { style: { padding: 20, borderRadius: 'var(--radius-md)', background: 'var(--color-neutral-100)' } },
            React.createElement(VueCalendar, { availability, onSelected: val => setSelection(val) }),
          ),
        ),
        // People
        React.createElement('div', { className: 'field' },
          React.createElement('label', null, 'How many people'),
          React.createElement('input', { className: 'input', type: 'number', min: 1, max: 8, value: form.people, onChange: e => setForm({ ...form, people: e.target.value }) }),
        ),
        // Name + Email
        React.createElement('div', { className: 'form-row-2', style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 } },
          React.createElement('div', { className: 'field' },
            React.createElement('label', null, 'Your name'),
            React.createElement('input', { className: 'input', type: 'text', placeholder: 'Thandi Meyer', value: form.name, onChange: e => setForm({ ...form, name: e.target.value }) }),
          ),
          React.createElement('div', { className: 'field' },
            React.createElement('label', null, 'Email'),
            React.createElement('input', { className: 'input', type: 'email', placeholder: 'you@example.com', value: form.email, onChange: e => setForm({ ...form, email: e.target.value }) }),
          ),
        ),
        // Phone
        React.createElement('div', { className: 'field' },
          React.createElement('label', null, 'Phone (optional)'),
          React.createElement('input', { className: 'input', type: 'tel', placeholder: '+27 82 000 0000', value: form.phone, onChange: e => setForm({ ...form, phone: e.target.value }) }),
        ),
        // Notes
        React.createElement('div', { className: 'field' },
          React.createElement('label', null, 'Anything we should know?'),
          React.createElement('textarea', { className: 'input', placeholder: "Kids' ages, knees, dietary things, where you're staying.", value: form.notes, onChange: e => setForm({ ...form, notes: e.target.value }) }),
        ),
        // Error
        error && React.createElement('div', { style: { padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--color-accent-100)', color: 'var(--color-accent-800)', fontSize: 14 } }, error),
        // Submit
        React.createElement('button', { type: 'submit', className: 'btn btn-primary btn-block', disabled: submitting, style: { minHeight: 52, fontSize: 17, opacity: submitting ? 0.6 : 1 } },
          submitting ? 'Booking…' : 'Request this booking'),
      ),
      // Right: Summary
      React.createElement('aside', { className: 'card elev-sm', style: { position: 'sticky', top: 96, gap: 14, padding: 30, background: 'var(--color-surface)' } },
        React.createElement('h3', { style: { margin: 0, fontSize: 24 } }, selectedItem?.name || 'Select a hike'),
        React.createElement('p', { style: { margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--color-neutral-700)' } }, selectedItem?.blurb || ''),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 9, paddingTop: 6, borderTop: '1px solid var(--color-divider)' } },
          ...[['Difficulty', selectedItem?.difficulty], ['On the trail', selectedItem?.duration], ['Date', selection.date || 'Not selected'], ['Time', selection.time || '—'], ['People', String(people)]].map(([label, val]) =>
            React.createElement('div', { key: label, style: { display: 'flex', justifyContent: 'space-between', fontSize: 15 } },
              React.createElement('span', { style: { color: 'var(--color-neutral-600)' } }, label),
              React.createElement('span', null, val || '—'),
            ),
          ),
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 12, borderTop: '1px solid var(--color-divider)' } },
            React.createElement('span', { style: { fontSize: 15, color: 'var(--color-neutral-600)' } }, 'Total'),
            React.createElement('span', { style: { fontFamily: 'var(--font-heading)', fontSize: 30 } }, selectedItem ? money(selectedItem.price * people) : '—'),
          ),
        ),
        React.createElement('p', { style: { margin: 0, fontSize: 13, lineHeight: 1.55, color: 'var(--color-neutral-600)' } },
          'Nothing is charged now — we confirm availability first and send a payment link.'),
      ),
    ),
  );
}

function ItemButton({ item, type, active, onClick }) {
  return React.createElement('button', {
    type: 'button', onClick,
    style: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 16, padding: '14px 18px', borderRadius: 'var(--radius-md)',
      border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-divider)'}`,
      background: active ? 'var(--color-accent-100)' : 'transparent',
      color: 'var(--color-text)', cursor: 'pointer', textAlign: 'left',
    },
  },
    React.createElement('span', { style: { display: 'flex', flexDirection: 'column', gap: 3 } },
      React.createElement('span', { style: { fontSize: 16, fontWeight: 600 } }, item.name),
      React.createElement('span', { style: { fontSize: 13, color: 'var(--color-neutral-600)' } },
        `${item.area} · ${item.duration} · ${type === 'hike' ? item.difficulty : 'Tour'}`),
    ),
    React.createElement('span', { style: { fontSize: 15, color: 'var(--color-neutral-700)' } }, money(item.price) + ' pp'),
  );
}

// ─── Router ───
function Router() {
  const route = useHashRoute();
  const parts = route.parts;
  let page;
  if (parts.length === 0) page = React.createElement(Home);
  else if (parts[0] === 'hikes' && parts.length === 1) page = React.createElement(HikesList);
  else if (parts[0] === 'hikes' && parts.length === 2) page = React.createElement(DetailPage, { type: 'hike', id: parts[1] });
  else if (parts[0] === 'tours' && parts.length === 1) page = React.createElement(ToursList);
  else if (parts[0] === 'tours' && parts.length === 2) page = React.createElement(DetailPage, { type: 'tour', id: parts[1] });
  else if (parts[0] === 'about') page = React.createElement(About);
  else if (parts[0] === 'book' && parts.length === 1) page = React.createElement(BookingPage);
  else if (parts[0] === 'book' && parts.length === 3) page = React.createElement(BookingPage, { preType: parts[1], preId: parts[2] });
  else page = React.createElement(Home);

  return React.createElement('div', { className: 'app-shell' },
    React.createElement(Header, { route }),
    React.createElement('main', { className: 'app-main' }, page),
    React.createElement(Footer),
  );
}

// ─── Mount ───
createRoot(document.getElementById('root')).render(React.createElement(Router));
