import { useEffect, useRef, useState } from 'react'
import { stats } from '../data/stats.js'
import './Stats.css'

// Starts its animations the first time it scrolls into view.
function useInView(threshold = 0.35) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, inView]
}

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function CountUp({ to, decimals = 0, start, duration = 2000 }) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    if (reducedMotion()) {
      setValue(to)
      return
    }
    let raf
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 4) // fast start, gentle landing
      setValue(to * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [start, to, duration])

  return value.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function Stars({ rating, start }) {
  return (
    <span className="stars" style={{ '--fill': start ? `${(rating / 5) * 100}%` : '0%' }} aria-hidden="true">
      <span className="stars-base">★★★★★</span>
      <span className="stars-fill">★★★★★</span>
    </span>
  )
}

export default function Stats({ id }) {
  const [ref, inView] = useInView()
  const { customers, vehiclesSold, googleRating, googleReviews, googleReviewsUrl } = stats

  return (
    <section id={id} ref={ref} className={`stats${inView ? ' is-in' : ''}`} aria-labelledby="stats-title">
      <div className="stats-inner">
        <p className="stats-eyebrow">Global TVS in numbers</p>
        <h2 id="stats-title" className="stats-title">
          Trusted by thousands of riders.
        </h2>

        <dl className="stats-grid">
          <div className="stat" style={{ '--d': '0ms' }}>
            <dt className="stat-label">Happy customers</dt>
            <dd className="stat-value">
              <CountUp to={customers} start={inView} />
              <span className="stat-plus">+</span>
            </dd>
          </div>

          <div className="stat" style={{ '--d': '120ms' }}>
            <dt className="stat-label">Vehicles delivered</dt>
            <dd className="stat-value">
              <CountUp to={vehiclesSold} start={inView} />
              <span className="stat-plus">+</span>
            </dd>
          </div>

          <div className="stat" style={{ '--d': '240ms' }}>
            <dt className="stat-label">Google rating</dt>
            <dd className="stat-value">
              <CountUp to={googleRating} decimals={1} start={inView} duration={1600} />
              <span className="stat-of">/5</span>
            </dd>
            <dd className="stat-extra">
              <Stars rating={googleRating} start={inView} />
              <a
                href={googleReviewsUrl}
                {...(googleReviewsUrl.startsWith('#') ? {} : { target: '_blank', rel: 'noreferrer' })}
              >
                {googleReviews.toLocaleString('en-IN')}+ reviews on Google
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
