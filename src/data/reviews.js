/*
  Customer reviews for the spinning-reels section.

  TO ADD A REAL REVIEW: put the customer's photo in public/reviews/ and add an entry to `real`:
    { id: 'ravi', name: 'Ravi K.', branch: 'Nagarbhavi', rating: 5,
      text: 'Copied from the Google review…', photo: '/reviews/ravi.jpg' }

  The photos below are real Global TVS customer moments (cut from screenshots of the
  old website and the Nagarbhavi Google listing, so they're low resolution). Swap in
  the original files when available.

  Entries with `sample: true` have placeholder REVIEW TEXT. They only appear while
  developing (npm run dev) and are removed automatically from the live site.
*/
const PHOTOS = [
  { file: 'keys-handed-over', caption: 'Keys handed over', branch: null },
  { file: 'family-scooter', caption: 'A new scooter for the family', branch: null },
  { file: 'trio-delivery', caption: 'Delivery day', branch: 'Nagarbhavi' },
  { file: 'riders-meet', caption: 'Riders meet', branch: null },
  { file: 'grey-scooter-handover', caption: 'Delivery day', branch: 'Nagarbhavi' },
  { file: 'blue-scooter', caption: 'First ride', branch: 'Nagarbhavi' },
  { file: 'masked-handover', caption: 'Delivery day', branch: 'Nagarbhavi' },
]

const SAMPLE_TEXT = [
  'Sample review: replace with a real Google review. Booking, paperwork and delivery explained clearly, and the bike was ready on the promised day.',
  'Sample review: replace with a real Google review. Helpful staff, clear EMI options and a smooth handover with the accessories fitted.',
  'Sample review: replace with a real Google review. Got test rides of two scooters back to back, which made choosing easy.',
  'Sample review: replace with a real Google review. Service visits are hassle-free and the team explains what was done before billing.',
  'Sample review: replace with a real Google review. Friendly showroom, no pressure, and every question answered.',
]

const samples = PHOTOS.map((p, i) => ({
  id: `sample-${i + 1}`,
  name: p.caption,
  branch: p.branch,
  rating: 5,
  text: SAMPLE_TEXT[i % SAMPLE_TEXT.length],
  photo: `/reviews/${p.file}.webp`,
  sample: true,
}))

const real = [
  // add real reviews here
]

export const reviews = import.meta.env.PROD ? real : [...real, ...samples]
