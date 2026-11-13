import { useState } from 'react'
import FindUs from '../components/FindUs.jsx'
import { ArrowRightIcon, PhoneIcon, PinIcon } from '../components/Icons.jsx'
import { branches } from '../data/branches.js'
import { PHONE, PHONE_DISPLAY, wa } from '../data/contact.js'
import models from '../data/models.js'
import './Contact.css'

const REASONS = ['Buy a new vehicle', 'Book a test ride', 'Book a service', 'Finance / EMI', 'Insurance', 'Something else']

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', branch: '', reason: REASONS[0], model: '', message: '' })
  const [tried, setTried] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const errors = {
    name: !form.name.trim() && 'Please enter your name',
    phone: !/^[6-9]\d{9}$/.test(form.phone) && 'Enter a 10-digit mobile number',
  }
  const valid = !errors.name && !errors.phone

  // No mail server yet: the enquiry opens in WhatsApp, ready to send to the showroom team.
  const submit = (e) => {
    e.preventDefault()
    setTried(true)
    if (!valid) return
    const lines = [
      'Hi Global TVS, I have an enquiry.',
      `Name: ${form.name.trim()}`,
      `Mobile: +91 ${form.phone}`,
      `Reason: ${form.reason}`,
      form.model && `Model: ${form.model}`,
      form.branch && `Preferred showroom: ${form.branch}`,
      form.message.trim() && `Message: ${form.message.trim()}`,
    ].filter(Boolean)
    window.open(wa(lines.join('\n')), '_blank', 'noopener')
  }

  return (
    <main className="contact">
      <section className="contact-hero">
        <p className="contact-eyebrow">Contact us</p>
        <h1 className="contact-title">We’re here to help.</h1>
        <p className="contact-lead">
          Buying, servicing or just curious about a model? Reach us whichever way suits you.
        </p>

        <div className="contact-ways">
          <a className="way" href={`tel:${PHONE}`} style={{ '--i': 0 }}>
            <span className="way-icon">
              <PhoneIcon />
            </span>
            <span className="way-label">Call us</span>
            <strong>{PHONE_DISPLAY}</strong>
            <span className="way-go">
              Call now <ArrowRightIcon width={16} height={16} />
            </span>
          </a>
          <a className="way" href={wa('Hi Global TVS, ')} target="_blank" rel="noreferrer" style={{ '--i': 1 }}>
            <span className="way-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" />
                <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8c-.9-.4-1.6-1.1-2-2l.8-1-1-2z" />
              </svg>
            </span>
            <span className="way-label">WhatsApp</span>
            <strong>Chat with our team</strong>
            <span className="way-go">
              Open chat <ArrowRightIcon width={16} height={16} />
            </span>
          </a>
          <a className="way" href="#contact" style={{ '--i': 2 }}>
            <span className="way-icon">
              <PinIcon />
            </span>
            <span className="way-label">Visit us</span>
            <strong>{branches.length} showrooms in Bengaluru</strong>
            <span className="way-go">
              See the map <ArrowRightIcon width={16} height={16} />
            </span>
          </a>
        </div>
      </section>

      {/* ---------- enquiry form ---------- */}
      <section className="contact-form-wrap">
        <div className="contact-form-intro">
          <p className="contact-eyebrow">Send an enquiry</p>
          <h2>Tell us what you need.</h2>
          <p>
            Fill this in and press send. It opens WhatsApp with your enquiry written out, so our team gets it straight away
            and can reply to you there.
          </p>
        </div>

        <form className="contact-form" onSubmit={submit} noValidate>
          <label className="cf-field">
            <span>Your name</span>
            <input value={form.name} onChange={set('name')} autoComplete="name" placeholder="Full name" aria-invalid={tried && !!errors.name} />
            {tried && errors.name && <em>{errors.name}</em>}
          </label>

          <label className="cf-field">
            <span>Mobile number</span>
            <div className="cf-phone">
              <b>+91</b>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="10-digit number"
                aria-invalid={tried && !!errors.phone}
              />
            </div>
            {tried && errors.phone && <em>{errors.phone}</em>}
          </label>

          <fieldset className="cf-field cf-full">
            <span>How can we help?</span>
            <div className="cf-chips">
              {REASONS.map((r) => (
                <label key={r} className={form.reason === r ? 'is-on' : ''}>
                  <input type="radio" name="reason" value={r} checked={form.reason === r} onChange={set('reason')} />
                  {r}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="cf-field">
            <span>Model (optional)</span>
            <select value={form.model} onChange={set('model')}>
              <option value="">Not sure yet</option>
              {models.map((m) => (
                <option key={m.slug}>{m.name}</option>
              ))}
            </select>
          </label>

          <label className="cf-field">
            <span>Preferred showroom (optional)</span>
            <select value={form.branch} onChange={set('branch')}>
              <option value="">Any showroom</option>
              {branches.map((b) => (
                <option key={b.id}>{b.area}</option>
              ))}
            </select>
          </label>

          <label className="cf-field cf-full">
            <span>Message (optional)</span>
            <textarea rows="4" value={form.message} onChange={set('message')} placeholder="Anything we should know?" />
          </label>

          <div className="cf-full cf-submit">
            <button type="submit">
              Send on WhatsApp <ArrowRightIcon width={18} height={18} />
            </button>
            <p>We usually reply within working hours.</p>
          </div>
        </form>
      </section>

      <FindUs />
    </main>
  )
}
