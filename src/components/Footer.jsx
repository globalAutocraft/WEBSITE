import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { branches } from '../data/branches.js'
import { PHONE, wa } from '../data/contact.js'
import { ArrowRightIcon, PhoneIcon } from './Icons.jsx'
import './Footer.css'

const WHATSAPP = `https://wa.me/${PHONE.replace('+', '')}`
const WORD = 'GLOBAL TVS'

// Social profiles. TODO: replace the '#' links with Global TVS's real profile URLs.
const SOCIAL = [
  { label: 'Instagram', url: '#', color: '#e1306c', icon: 'instagram' },
  { label: 'Facebook', url: '#', color: '#1877f2', icon: 'facebook' },
  { label: 'X', url: '#', color: '#ffffff', ink: '#050507', icon: 'x' },
  { label: 'YouTube', url: '#', color: '#ff0033', icon: 'youtube' },
  { label: 'WhatsApp', url: WHATSAPP, color: '#25d366', ink: '#050507', icon: 'whatsapp' },
]

const SOCIAL_PATHS = {
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" />
    </>
  ),
  facebook: <path d="M14.5 8H17V4.5h-2.5c-2.5 0-4 1.6-4 4.2V11H8v3.5h2.5V21H14v-6.5h2.6l.4-3.5h-3V9c0-.6.4-1 .5-1z" />,
  // the X (formerly Twitter) mark, solid like the real logo
  x: (
    <path
      transform="translate(3.6 3.6) scale(0.7)"
      fill="currentColor"
      stroke="none"
      d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
    />
  ),
  youtube: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" />
      <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8c-.9-.4-1.6-1.1-2-2l.8-1-1-2z" />
    </>
  ),
}

const openMenu = (pane) => window.dispatchEvent(new CustomEvent('open-menu', { detail: pane }))

export default function Footer() {
  const wordRef = useRef(null)
  const [inView, setInView] = useState(false)
  const navigate = useNavigate()

  // fly the map to a showroom; from another page, go to the home page map first
  const showBranch = (id) => {
    const fire = () => window.dispatchEvent(new CustomEvent('show-branch', { detail: id }))
    if (document.getElementById('contact')) return fire()
    navigate('/#contact')
    setTimeout(fire, 700)
  }

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setInView(true), { threshold: 0.3 })
    io.observe(wordRef.current)
    return () => io.disconnect()
  }, [])

  const link = (label, onClick) => (
    <li key={label}>
      <button type="button" onClick={onClick}>
        {label}
      </button>
    </li>
  )

  return (
    <footer className="footer">
      <div className="footer-cta">
        <h2 className="footer-cta-title">
          Your next ride
          <br />
          is waiting.
        </h2>
        <div className="footer-cta-actions">
          <a className="f-btn f-btn-light" href={wa("Hi Global TVS, I would like to book a test ride.")} target="_blank" rel="noreferrer">
            Book a test ride <ArrowRightIcon width={18} height={18} />
          </a>
          <a className="f-btn" href={`tel:${PHONE}`}>
            <PhoneIcon width={18} height={18} /> Call us
          </a>
          <a className="f-btn" href={WHATSAPP} target="_blank" rel="noreferrer">
            <WhatsAppIcon /> WhatsApp
          </a>
          <ul className="footer-social">
            {SOCIAL.map((s, i) => (
              <li key={s.label} style={{ '--brand': s.color, '--ink': s.ink || '#fff', '--i': i }}>
                <a href={s.url} target="_blank" rel="noreferrer" aria-label={s.label} title={s.label}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {SOCIAL_PATHS[s.icon]}
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer-cols">
        <div>
          <p className="footer-label">Models</p>
          <ul>
            {link('Motorcycles', () => navigate('/models/motorcycles'))}
            {link('Scooters', () => navigate('/models/scooters'))}
            {link('Electric', () => navigate('/models/electric'))}
          </ul>
        </div>
        <div>
          <p className="footer-label">Showrooms</p>
          <ul>{branches.map((b) => link(b.area, () => showBranch(b.id)))}</ul>
        </div>
        <div>
          <p className="footer-label">Services</p>
          <ul>
            <li><a href={wa("Hi Global TVS, I would like to book a test ride.")} target="_blank" rel="noreferrer">Book a Test Ride</a></li>
            <li><Link to="/services#book">Book a Service</Link></li>
            <li><Link to="/services">All Services</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            {link('Careers', () => openMenu('careers'))}
            <li><Link to="/#reviews">Customer Reviews</Link></li>
          </ul>
        </div>
        <div>
          <p className="footer-label">Get in touch</p>
          <ul>
            <li><a href={`tel:${PHONE}`}>+91 7619 37 5566</a></li>
            <li><a href={WHATSAPP} target="_blank" rel="noreferrer">WhatsApp us</a></li>
            {link('Account & login', () => openMenu('account'))}
          </ul>
        </div>
      </div>

      <div ref={wordRef} className={`footer-word${inView ? ' is-in' : ''}`} aria-hidden="true">
        {WORD.split('').map((ch, i) => (
          <span key={i} className={i < 6 ? 'is-blue' : undefined} style={{ '--i': i }}>{ch === ' ' ? ' ' : ch}</span>
        ))}
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Global TVS · Authorised TVS Motor Company dealer, Bengaluru</p>
        <BackToTop />
      </div>
    </footer>
  )
}

// Round button whose ring fills as you scroll down the page.
function BackToTop() {
  const ringRef = useRef(null)
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - innerHeight
      const p = max > 0 ? scrollY / max : 0
      ringRef.current?.style.setProperty('--p', p.toFixed(3))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    addEventListener('scroll', onScroll, { passive: true })
    return () => removeEventListener('scroll', onScroll)
  }, [])
  return (
    <button
      ref={ringRef}
      className="to-top"
      onClick={() => scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
    >
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="22" className="to-top-track" />
        <circle cx="24" cy="24" r="22" className="to-top-fill" pathLength="1" />
        <path d="M24 32V16M17 23l7-7 7 7" className="to-top-arrow" />
      </svg>
    </button>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" />
      <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8c-.9-.4-1.6-1.1-2-2l.8-1-1-2z" />
    </svg>
  )
}
