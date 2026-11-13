import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import models from '../data/models.json'
import { wa } from '../data/contact.js'
import { prettyColour, swatchBackground } from '../data/swatch.js'
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/Icons.jsx'
import './ModelDetail.css'

const CATEGORY_LABEL = { motorcycles: 'Motorcycle', scooters: 'Scooter', electric: 'Electric' }
const seriesOf = (m) => (m.name.startsWith('TVS ') ? m.name.slice(4) : m.name.split(' ')[0])

export default function ModelDetail() {
  const { slug } = useParams()
  const m = models.find((x) => x.slug === slug)
  if (!m) return <Navigate to="/models/all" replace />
  // key: a fresh page state for every model
  return <Detail key={m.slug} m={m} />
}

function Detail({ m }) {
  const [variant, setVariant] = useState(m.variants[0] || null)
  const colourByName = useMemo(() => Object.fromEntries(m.colours.map((c) => [c.name, c])), [m])

  // colours offered in this variant (falls back to every colour if the catalogue has none listed)
  const variantColours = useMemo(() => {
    const list = (variant?.colours || []).map((n) => colourByName[n] || { name: n, image: null })
    return list.length ? list : m.colours
  }, [variant, colourByName, m.colours])

  const [colour, setColour] = useState(variantColours[0] || null)
  useEffect(() => {
    // keep the chosen colour if this variant has it too, otherwise take its first one
    setColour((c) => variantColours.find((x) => x.name === c?.name) || variantColours[0] || null)
  }, [variantColours])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  const sideImage = colour?.image || m.colours[0]?.image || m.image
  const what = `${m.name}${variant ? ` ${variant.name}` : ''}${colour ? ` in ${prettyColour(colour.name)}` : ''}`

  return (
    <main className="md">
      {/* ---------- hero ---------- */}
      <section className="md-hero">
        <Link className="md-back" to={`/models/${m.category}`}>
          <ChevronLeftIcon width={18} height={18} /> All {CATEGORY_LABEL[m.category].toLowerCase()}s
        </Link>
        <div className="md-stage">
          <img key={sideImage} className="md-bike" src={sideImage} alt={`${m.name}${colour ? ` in ${prettyColour(colour.name)}` : ''}`} />
        </div>

        {m.variants.length > 1 && (
          <div className="md-tabs" role="tablist" aria-label="Variants">
            {m.variants.map((v) => (
              <button
                key={v.name}
                role="tab"
                aria-selected={variant?.name === v.name}
                className={variant?.name === v.name ? 'is-on' : ''}
                onClick={() => setVariant(v)}
              >
                {v.name}
              </button>
            ))}
          </div>
        )}

        <h1 className="md-name">{m.name}</h1>
        <div className="md-tags">
          <span>{CATEGORY_LABEL[m.category]}</span>
          <span>{m.fuel}</span>
        </div>

        {variantColours.length > 0 && (
          <div className="md-colours">
            <div className="md-swatches">
              {variantColours.map((c) => (
                <button
                  key={c.name}
                  className={`md-swatch${colour?.name === c.name ? ' is-on' : ''}`}
                  style={{ background: swatchBackground(c.name) }}
                  onClick={() => setColour(c)}
                  aria-label={prettyColour(c.name)}
                  aria-pressed={colour?.name === c.name}
                  title={prettyColour(c.name)}
                />
              ))}
            </div>
            <p>{colour ? prettyColour(colour.name) : ''}</p>
          </div>
        )}

        <div className="md-actions">
          <a className="md-btn md-btn-dark" href={wa(`Hi Global TVS, I'd like to book the ${what}.`)} target="_blank" rel="noreferrer">
            Book now
          </a>
          <a className="md-btn" href={wa(`Hi Global TVS, I'd like to book a test ride of the ${m.name}.`)} target="_blank" rel="noreferrer">
            Book a test ride
          </a>
        </div>
        <p className="md-note">Prices and availability are confirmed by our team on WhatsApp or at the showroom.</p>
      </section>

      {/* ---------- figures + front view ---------- */}
      <Figures m={m} variant={variant} />

      {/* ---------- related models ---------- */}
      <Related m={m} />

      {/* ---------- feedback ---------- */}
      <Helpful slug={m.slug} />
    </main>
  )
}

function useInView(threshold = 0.25) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setInView(true), io.disconnect()), { threshold })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [threshold])
  return [ref, inView]
}

function Figures({ m, variant }) {
  const [ref, inView] = useInView()
  const [open, setOpen] = useState(false)
  return (
    <section ref={ref} className={`md-figures${inView ? ' is-in' : ''}`}>
      <div className="md-stats">
        <div style={{ '--d': '0ms' }}>
          <p className="md-big">
            {m.variants.length}
            <span>{m.variants.length === 1 ? 'variant' : 'variants'}</span>
          </p>
          <p className="md-label">Versions to choose from</p>
        </div>
        <div style={{ '--d': '120ms' }}>
          <p className="md-big">
            {m.colours.length || '–'}
            <span>colours</span>
          </p>
          <p className="md-label">Paint options</p>
        </div>
        <div style={{ '--d': '240ms' }}>
          <p className="md-big">{m.fuel}</p>
          <p className="md-label">{m.fuel === 'Electric' ? 'Battery powered' : 'Fuel type'}</p>
        </div>

        <button className="md-btn md-btn-soft" onClick={() => setOpen(!open)} aria-expanded={open}>
          {open ? 'Hide variants' : 'View all variants'}
        </button>
        <div className={`md-variants${open ? ' is-open' : ''}`}>
          <ul>
            {m.variants.map((v) => (
              <li key={v.name} className={variant?.name === v.name ? 'is-on' : ''}>
                <span>{v.name}</span>
                <small>{v.colours.map(prettyColour).join(', ') || '—'}</small>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="md-front">
        <img src={m.image} alt={`${m.name}, front view`} loading="lazy" />
      </div>
    </section>
  )
}

function Related({ m }) {
  const series = seriesOf(m)
  const sameSeries = models.filter((x) => seriesOf(x) === series)
  // a series with several models (Apache, NTORQ…) compares within it; otherwise the whole category
  const list = sameSeries.length > 1 ? sameSeries : models.filter((x) => x.category === m.category)
  const heading = sameSeries.length > 1 ? series : `${CATEGORY_LABEL[m.category].toLowerCase()}`
  const track = useRef(null)
  const [page, setPage] = useState(0)
  const [pages, setPages] = useState(1)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  useEffect(() => {
    const el = track.current
    const update = () => {
      const max = el.scrollWidth - el.clientWidth
      const n = Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth - 0.05))
      // arrows follow the real scroll position, not a rounded page number
      setCanPrev(el.scrollLeft > 4)
      setCanNext(el.scrollLeft < max - 4)
      setPages(n)
      setPage(max > 0 ? Math.round((el.scrollLeft / max) * (n - 1)) : 0)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      removeEventListener('resize', update)
    }
  }, [list.length])

  const go = (dir) => track.current.scrollBy({ left: dir * track.current.clientWidth * 0.9, behavior: 'smooth' })

  return (
    <section className="md-related">
      <h2>Which {heading} is the right one for you?</h2>
      <div className="md-related-bar">
        <p>{list.length} models</p>
        <div className="md-arrows">
          <button onClick={() => go(-1)} disabled={!canPrev} aria-label="Previous">
            <ChevronLeftIcon />
          </button>
          <button onClick={() => go(1)} disabled={!canNext} aria-label="Next">
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      <div ref={track} className="md-track">
        {list.map((x) => (
          <Link key={x.slug} to={`/model/${x.slug}`} className={`md-rcard${x.slug === m.slug ? ' is-current' : ''}`}>
            <span className="md-rimg">
              <img src={x.colours[0]?.image || x.image} alt="" loading="lazy" />
            </span>
            <span className="md-rname">{x.name}</span>
            <span className="md-rtags">
              <span className="is-dark">{CATEGORY_LABEL[x.category]}</span>
              <span>{x.fuel}</span>
              <span>
                {x.variants.length} {x.variants.length === 1 ? 'variant' : 'variants'}
              </span>
            </span>
            <span className="md-rmore">
              {x.slug === m.slug ? 'You are viewing this model' : 'Explore'} {x.slug !== m.slug && <ArrowRightIcon width={16} height={16} />}
            </span>
          </Link>
        ))}
      </div>

      {pages > 1 && (
        <div className="md-dots" aria-hidden="true">
          {Array.from({ length: pages }, (_, i) => (
            <span key={i} className={i === page ? 'is-on' : ''} />
          ))}
        </div>
      )}

      <div className="md-compare">
        <p>Want to see every model side by side?</p>
        <Link className="md-btn md-btn-soft" to={`/models/${m.category}`}>
          <ArrowRightIcon width={18} height={18} /> See all {CATEGORY_LABEL[m.category].toLowerCase()}s
        </Link>
      </div>
    </section>
  )
}

function Helpful({ slug }) {
  const key = `gtvs-helpful-${slug}`
  const [score, setScore] = useState(() => {
    try {
      return Number(localStorage.getItem(key)) || 0
    } catch {
      return 0
    }
  })
  const rate = (n) => {
    setScore(n)
    try {
      localStorage.setItem(key, String(n))
    } catch {
      /* storage blocked */
    }
  }
  return (
    <section className="md-helpful">
      <h2>{score ? 'Thanks for your feedback!' : 'How helpful is the information on this page for you?'}</h2>
      <div className="md-rate">
        <span>Not helpful at all</span>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} className={score === n ? 'is-on' : ''} onClick={() => rate(n)} aria-pressed={score === n}>
            {n}
          </button>
        ))}
        <span>Very helpful</span>
      </div>
    </section>
  )
}
