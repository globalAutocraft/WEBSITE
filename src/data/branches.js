// Global TVS branches (all in Bengaluru), shown on the "Find us" map.
// Ratings and review counts are from each branch's Google Maps listing, 2026-11-13.
// TODO: coordinates are APPROXIMATE (worked out from street names). For exact pins,
// open each branch on Google Maps → Share → Copy link, and send the links.
const q = (s) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s)}`

export const branches = [
  {
    id: 'basaveshwaranagar',
    area: 'Basaveshwaranagar',
    name: 'Global Autocraft (2 wheeler & EV)',
    address: 'No 113/2-6, Industrial Town Rd, Basaveshwaranagar',
    rating: 4.8,
    reviews: 1775,
    lngLat: [77.5418, 12.9797],
    mapsUrl: q('Global Autocraft (2 wheeler & EV) Basaveshwarnagar Bengaluru'),
  },
  {
    id: 'mahalakshmi-layout',
    area: 'Mahalakshmi Layout',
    name: 'Global Auto Craft TVS (2 wheeler & EV)',
    address: 'Near Sri Prasanna Veeranjaneya Swamy Temple, Mahalakshmi Layout',
    rating: 4.7,
    reviews: 2242,
    lngLat: [77.544, 13.0083],
    mapsUrl: q('Global Auto Craft TVS (2 wheeler & EV) Mahalakshmi Layout Bengaluru'),
  },
  {
    id: 'nagarbhavi',
    area: 'Nagarbhavi',
    name: 'Global Autocraft - TVS (2 wheeler & EV)',
    address: 'Outer Ring Rd, Nagarbhavi',
    rating: 4.4,
    reviews: 3183,
    lngLat: [77.513, 12.97],
    mapsUrl: q('Global Autocraft - TVS (2 wheeler & EV) Nagarbhavi Bengaluru'),
  },
  {
    id: 'hesaraghatta',
    area: 'Hesaraghatta',
    name: 'Global Autocraft TVS',
    address: 'Hesaraghatta Main Rd', // TODO: CONFIRM address, rating and location
    rating: null,
    reviews: null,
    lngLat: [77.5078, 13.0517],
    mapsUrl: q('Global Autocraft TVS Hesaraghatta Bengaluru'),
  },
]
