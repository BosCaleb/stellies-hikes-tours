// Mountain areas shown on the home page and in the footer.
// Franschhoek has no dedicated hike yet, so it links to the photography tour that covers it.
export const regions = [
  {
    name: 'Stellenbosch',
    image: '/images/mountains/area-stellenbosch.jpg',
    alt: 'The Twin Peaks above the Jonkershoek Valley, Stellenbosch',
    blurb: "Jonkershoek's jagged Twin Peaks and fynbos trails on the edge of town.",
    to: '/hikes?area=Stellenbosch',
    linkLabel: 'View hikes',
  },
  {
    name: 'Pniel',
    image: '/images/mountains/area-pniel.jpg',
    alt: 'The Simonsberg seen from the Drakenstein slopes above Kylemore and Pniel',
    blurb: 'Sunrise ridges and village walks beneath the Simonsberg.',
    to: '/hikes?area=Pniel',
    linkLabel: 'View hikes',
  },
  {
    name: 'Paarl',
    image: '/images/mountains/area-paarl.jpg',
    alt: 'Granite boulders and domes on Paarl Mountain',
    blurb: 'Giant granite domes with views across the Berg River valley.',
    to: '/hikes?area=Paarl',
    linkLabel: 'View hikes',
  },
  {
    name: 'Franschhoek',
    image: '/images/mountains/area-franschhoek.jpg',
    alt: 'Mountains rising above the Franschhoek valley',
    blurb: 'A high valley ringed by the Franschhoek and Groot Drakenstein mountains.',
    to: '/tours/photography-tour',
    linkLabel: 'Photography tour',
  },
];
