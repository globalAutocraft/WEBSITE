import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ArrowRightIcon } from '../components/Icons.jsx'
import { branches } from '../data/branches.js'
import { wa } from '../data/contact.js'
import models from '../data/models.json'
import { services } from '../data/services.js'
import './Services.css'

const TABS = [
  { id: 'promise', label: 'Our promise' },
  { id: 'offering', label: 'Service offering' },
  { id: 'book', label: 'Book a service' },
]

const SERVICE_TYPES = ['Periodic service', 'Repair', 'Accident repair', 'Accessory fitting', 'Other']

export default function Services() {
  const { hash } = useLocation()
  const [active, setActive] = useState('promise')

  // arriving with #parts, #book…: scroll there once the page has rendered
  useEffect(() => {
    if (!hash) return
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
    return () => clearTimeout(t)
  }, [hash])

  // highlight the tab for the section currently in view
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    TABS.forEach((t) => io.observe(document.getElementById(t.id)))
    return () => io.disconnect()
  }, [])

  return (
    <main className="svc">
      {/* ---------- hero ---------- */}
      <section className="svc-hero">
        <img src="/images/service/hero.webp" alt="Technicians working on an Apache RR 310 in the workshop" />
        <div className="svc-hero-shade" />
        <h1>Global TVS Service</h1>
      </section>

      {/* ---------- sticky section tabs ---------- */}
      <nav className="svc-tabs" aria-label="On this page">
        <div>
          {TABS.map((t) => (
            <a key={t.id} href={`#${t.id}`} className={active === t.id ? 'is-on' : ''}>
              {t.label}
            </a>
          ))}
        </div>
      </nav>

      {/* ---------- our promise ---------- */}
      <section id="promise" className="svc-promise">
        <h2>Our promise</h2>
        <p className="svc-lead">
          Your two-wheeler gets you through every day. We look after it the same way: carefully, with genuine parts, and
          with a team that explains what was done and why.
        </p>
        <Reveal className="svc-points">
          <div style={{ '--d': '0ms' }}>
            <span>01</span>
            <h3>TVS-trained technicians</h3>
            <p>People who know your model inside out.</p>
          </div>
          <div style={{ '--d': '120ms' }}>
            <span>02</span>
            <h3>Genuine TVS parts</h3>
            <p>Spares and oils made for your vehicle.</p>
          </div>
          <div style={{ '--d': '240ms' }}>
            <span>03</span>
            <h3>{branches.length} showrooms</h3>
            <p>Across Bengaluru, close to where you ride.</p>
          </div>
        </Reveal>
      </section>

      {/* ---------- service offering ---------- */}
      <section id="offering" className="svc-offering">
        <h2>Service offering</h2>
        <Reveal className="svc-cards">
          {services.map((s, i) => (
            <article key={s.id} id={s.id} className="svc-card" style={{ '--d': `${i * 100}ms` }}>
              <div className="svc-card-img">
                <img src={s.image} alt="" loading="lazy" />
              </div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <a href={s.cta.href} {...(s.cta.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}>
                <ArrowRightIcon width={18} height={18} /> {s.cta.label}
              </a>
            </article>
          ))}
        </Reveal>
      </section>

      {/* ---------- book a service ---------- */}
      <BookService />
    </main>
  )
}

// fades its children up the first time it scrolls into view
function Reveal({ className, children }) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setInView(true), io.disconnect()), { threshold: 0.15 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={`${className} svc-reveal${inView ? ' is-in' : ''}`}>
      {children}
    </div>
  )
}

function BookService() {
  const [f, setF] = useState({ name: '', phone: '', model: '', reg: '', type: SERVICE_TYPES[0], branch: '', date: '' })
  const [tried, setTried] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const errors = {
    name: !f.name.trim() && 'Please enter your name',
    phone: !/^[6-9]\d{9}$/.test(f.phone) && 'Enter a 10-digit mobile number',
  }
  const today = new Date().toISOString().slice(0, 10)

  // No booking system yet: the request opens in WhatsApp, ready to send to the service team.
  const submit = (e) => {
    e.preventDefault()
    setTried(true)
    if (errors.name || errors.phone) return
    const lines = [
      'Hi Global TVS, I would like to book a service.',
      `Name: ${f.name.trim()}`,
      `Mobile: +91 ${f.phone}`,
      `Service: ${f.type}`,
      f.model && `Vehicle: ${f.model}`,
      f.reg && `Registration: ${f.reg.toUpperCase()}`,
      f.branch && `Showroom: ${f.branch}`,
      f.date && `Preferred date: ${new Date(f.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    ].filter(Boolean)
    window.open(wa(lines.join('\n')), '_blank', 'noopener')
  }

  return (
    <section id="book" className="svc-book">
      <div className="svc-book-intro">
        <h2>Book a service</h2>
        <p>Pick a date and a showroom. Press send and your booking request opens in WhatsApp for our service team to confirm.</p>
      </div>

      <form className="svc-form" onSubmit={submit} noValidate>
        <label>
          <span>Your name</span>
          <input value={f.name} onChange={set('name')} autoComplete="name" aria-invalid={tried && !!errors.name} />
          {tried && errors.name && <em>{errors.name}</em>}
        </label>
        <label>
          <span>Mobile number</span>
          <input
            value={f.phone}
            onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="10-digit number"
            aria-invalid={tried && !!errors.phone}
          />
          {tried && errors.phone && <em>{errors.phone}</em>}
        </label>

        <fieldset className="svc-full">
          <span>What do you need?</span>
          <div className="svc-chips">
            {SERVICE_TYPES.map((t) => (
              <label key={t} className={f.type === t ? 'is-on' : ''}>
                <input type="radio" name="type" value={t} checked={f.type === t} onChange={set('type')} />
                {t}
              </label>
            ))}
          </div>
        </fieldset>

        <label>
          <span>Vehicle (optional)</span>
          <select value={f.model} onChange={set('model')}>
            <option value="">Choose your model</option>
            {models.map((m) => (
              <option key={m.slug}>{m.name}</option>
            ))}
            <option>Other TVS model</option>
          </select>
        </label>
        <label>
          <span>Registration number (optional)</span>
          <input value={f.reg} onChange={set('reg')} placeholder="KA 00 XX 0000" style={{ textTransform: 'uppercase' }} />
        </label>
        <label>
          <span>Showroom (optional)</span>
          <select value={f.branch} onChange={set('branch')}>
            <option value="">Any showroom</option>
            {branches.map((b) => (
              <option key={b.id}>{b.area}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Preferred date (optional)</span>
          <input type="date" min={today} value={f.date} onChange={set('date')} />
        </label>

        <div className="svc-full svc-submit">
          <button type="submit">
            Send booking request <ArrowRightIcon width={18} height={18} />
          </button>
        </div>
      </form>
    </section>
  )
}
