import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { branches } from '../data/branches.js'
import { company } from '../data/company.js'
import { PHONE } from '../data/contact.js'
import { PhoneIcon, PinIcon } from './Icons.jsx'
import './Profile.css'

export default function Profile() {
  const navigate = useNavigate()
  const sectionRef = useRef(null)
  const imageRef = useRef(null)
  const [inView, setInView] = useState(false)

  // reveal once when the section scrolls in
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    io.observe(sectionRef.current)
    return () => io.disconnect()
  }, [])

  // gentle parallax: the photo drifts slower than the page
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const update = () => {
      raf = 0
      const el = imageRef.current
      if (!el) return
      const r = el.parentElement.getBoundingClientRect()
      const progress = (window.innerHeight - r.top) / (window.innerHeight + r.height) // 0 → 1 across the screen
      el.style.setProperty('--shift', `${(progress - 0.5) * -12}%`)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section ref={sectionRef} id="about" className={`profile${inView ? ' is-in' : ''}`} aria-labelledby="profile-title">
      <div className="profile-head">
        <div>
          <p className="profile-eyebrow">About {company.name}</p>
          <h2 id="profile-title" className="profile-title">
            {company.headline}
          </h2>
        </div>
        <div className="profile-intro">
          <p>{company.intro}</p>
          <div className="profile-actions">
            <a className="btn-dark" href="#contact">
              <PinIcon width={18} height={18} />
              Visit a showroom
            </a>
            <a className="btn-line" href={`tel:${PHONE}`}>
              <PhoneIcon width={18} height={18} />
              Call us
            </a>
          </div>
        </div>
      </div>

      <figure className="profile-media">
        <img
          ref={imageRef}
          src="/images/profile-garage.webp"
          alt="TVS Racing team working on an Apache RR 310 in the garage"
          loading="lazy"
          decoding="async"
        />
        <figcaption className="profile-badge">
          <span className="profile-badge-dot" />
          Authorised TVS dealer
        </figcaption>
      </figure>

      <ol className="profile-pillars">
        {company.pillars.map((p, i) => (
          <li key={p.title} style={{ '--d': `${i * 90}ms` }}>
            <span className="pillar-num">{String(i + 1).padStart(2, '0')}</span>
            <h3>{p.title}</h3>
            <p>{p.text}</p>
          </li>
        ))}
      </ol>

      <div className="profile-showrooms">
        <span className="showrooms-label">Our showrooms</span>
        <ul>
          {branches.map((b) => (
            <li key={b.id}>
              <a
                href="#contact"
                onClick={(e) => {
                  // the map section scrolls itself into view and flies to this showroom
                  e.preventDefault()
                  const fire = () => window.dispatchEvent(new CustomEvent('show-branch', { detail: b.id }))
                  // no map on this page (e.g. About): open the Contact page, which has one
                  if (document.getElementById('contact')) fire()
                  else (navigate('/contact#contact'), setTimeout(fire, 700))
                }}
              >
                <PinIcon width={16} height={16} />
                {b.area}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
