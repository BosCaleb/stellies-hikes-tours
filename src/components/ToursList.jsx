import { api } from '../api.js';
import ExperienceBrowser from './ExperienceBrowser.jsx';

const HERO = {
  image: '/images/mountains/simonsberg-wine-estates.jpg',
  alt: 'Wine estates below the Simonsberg outside Stellenbosch',
  eyebrow: 'Guided tours',
  title: 'Tours',
  lead: 'Guided cultural, wine and nature tours through the Cape Winelands. Relaxed pace, local guides, and a story at every stop.',
};

export default function ToursList() {
  return <ExperienceBrowser type="tour" noun="tour" load={api.getTours} hero={HERO} />;
}
