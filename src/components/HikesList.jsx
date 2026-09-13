import { api } from '../api.js';
import ExperienceBrowser from './ExperienceBrowser.jsx';

const HERO = {
  image: '/images/mountains/pniel-kylemore-panorama.jpg',
  alt: 'The Simonsberg and the Kylemore valley seen from the Groot Drakenstein slopes',
  eyebrow: 'Guided hikes',
  title: 'Hikes',
  lead: 'Every walk runs with eight people or fewer. Prices are per person and include a guide, permits, water and something to eat at the top.',
};

export default function HikesList() {
  return <ExperienceBrowser type="hike" noun="hike" load={api.getHikes} hero={HERO} showDifficulty />;
}
