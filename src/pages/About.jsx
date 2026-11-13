import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Profile from '../components/Profile.jsx'
import { asset } from '../lib/asset.js'
import Stats from '../components/Stats.jsx'
import { ArrowRightIcon, PhoneIcon } from '../components/Icons.jsx'
import { branches } from '../data/branches.js'
import { company } from '../data/company.js'
import { PHONE, wa } from '../data/contact.js'
import './About.css'

// Real customer delivery photos (see src/data/reviews.js for where they came from)
const MOMENTS = [
  ['keys-handed-over', 'Keys handed over'],
  ['family-scooter', 'A new scooter for the family'],
  ['trio-delivery', 'Delivery day'],
  ['riders-meet', 'Riders meet'],
  ['grey-scooter-handover', 'Delivery day'],
  ['blue-scooter', 'First ride'],
  ['masked-handover', 'Delivery day'],
]

function useInView(threshold = 0.2) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setInView(true), io.disconnect()), { threshold })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [threshold])
  return [ref, inView]
}

export default function About() {
  const [branchRef, branchesIn] = useInView()

  return (
    <main className="about">
      {/* ---------- opening ---------- */}
      <section className="about-hero">
        <p className="about-eyebrow">About us</p>
        <h1 className="about-title">
          Bengaluru’s home
          <br />
          for TVS.
        </h1>
        <p className="about-lead">{company.intro}</p>
        <div className="about-facts">
          <div>
            <strong>{branches.length}</strong>
            <span>showrooms across Bengaluru</span>
          </div>
          <div>
            <strong>Sales · Service · Spares</strong>
            <span>all under one roof</span>
          </div>
          <div>
            <strong>Authorised</strong>
            <span>TVS Motor Company dealer</span>
          </div>
        </div>
      </section>

      <Stats />
      <Profile />

      {/* ---------- showrooms ---------- */}
      <section ref={branchRef} className={`about-branches${branchesIn ? ' is-in' : ''}`}>
        <div className="about-head">
          <p className="about-eyebrow">Our showrooms</p>
          <h2>Visit us at any of our {branches.length} branches.</h2>
        </div>
        <div className="branch-grid">
          {branches.map((b, i) => (
            <article key={b.id} className="branch-card" style={{ '--i': i }}>
              <span className="branch-card-num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{b.area}</h3>
              <p className="branch-card-name">{b.name}</p>
              {b.rating && (
                <p className="branch-card-rating">
                  <span>★</span> {b.rating.toFixed(1)} <small>({b.reviews.toLocaleString('en-IN')} Google reviews)</small>
                </p>
              )}
              <p className="branch-card-address">{b.address}, Bengaluru</p>
              <div className="branch-card-actions">
                <a href={b.mapsUrl} target="_blank" rel="noreferrer">
                  Directions <ArrowRightIcon width={16} height={16} />
                </a>
                <a href={`tel:${PHONE}`}>
                  <PhoneIcon width={16} height={16} /> Call
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- customer moments: a slow endless strip ---------- */}
      <section className="about-moments" aria-label="Customer moments">
        <div className="about-head">
          <p className="about-eyebrow">Customer moments</p>
          <h2>Every delivery is a small celebration.</h2>
        </div>
        <div className="moments-strip">
          <div className="moments-track">
            {[...MOMENTS, ...MOMENTS].map(([file, caption], i) => (
              <figure key={i} aria-hidden={i >= MOMENTS.length}>
                <img src={asset(`/reviews/${file}.webp`)} alt={i < MOMENTS.length ? caption : ''} loading="lazy" />
                <figcaption>{caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- careers + contact ---------- */}
      <section className="about-cta">
        <div className="about-cta-card">
          <p className="about-eyebrow">Careers</p>
          <h2>Love two-wheelers? Work with us.</h2>
          <p>Sales, service, finance and front desk roles across our showrooms.</p>
          <a className="about-btn about-btn-dark" href={wa('Hi Global TVS, I would like to apply for a job. My name is ')} target="_blank" rel="noreferrer">
            Send your CV on WhatsApp <ArrowRightIcon width={18} height={18} />
          </a>
        </div>
        <div className="about-cta-card is-dark">
          <p className="about-eyebrow">Get in touch</p>
          <h2>Questions? We’re one message away.</h2>
          <p>Call, WhatsApp or drop in at the showroom nearest you.</p>
          <Link className="about-btn about-btn-light" to="/contact">
            Contact us <ArrowRightIcon width={18} height={18} />
          </Link>
        </div>
      </section>
    </main>
  )
}
