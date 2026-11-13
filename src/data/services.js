import { PHONE, wa } from './contact.js'

// Services shown in the menu panel and on /services. Edit the wording freely.
export const services = [
  {
    id: 'maintenance',
    title: 'Service & Maintenance',
    text: 'From periodic servicing to repairs, our TVS-trained technicians take care of your two-wheeler with the right tools and genuine parts, so it rides the way it did on day one.',
    image: '/images/service/maint.webp',
    cta: { label: 'Book a service', href: wa('Hi Global TVS, I would like to book a service for my vehicle.') },
  },
  {
    id: 'parts',
    title: 'Genuine Parts & Accessories',
    text: 'Genuine TVS spares, oils and accessories made for your model: helmets, riding gear, guards, covers and more, fitted at the showroom.',
    image: '/images/service/parts.webp',
    cta: { label: 'Ask about a part', href: wa('Hi Global TVS, I am looking for a genuine part / accessory for my vehicle: ') },
  },
  {
    id: 'finance',
    title: 'Finance & Insurance',
    text: 'Help with EMIs, loans, insurance and registration, explained clearly and handled at the showroom so you can ride home sooner.',
    image: '/reviews/keys-handed-over.webp',
    cta: { label: 'Ask about EMI options', href: wa('Hi Global TVS, I would like to know the EMI / finance options for ') },
  },
  {
    id: 'roadside',
    title: 'Roadside Assistance',
    text: 'Stuck on the road? Call us and our team will guide you to the quickest help near you.',
    image: '/images/service/road.webp',
    cta: { label: 'Call for help', href: `tel:${PHONE}` },
  },
]
