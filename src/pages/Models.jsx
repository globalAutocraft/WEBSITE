import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import models from '../data/models.js'
import { PHONE } from '../data/contact.js'
import { prettyColour, swatchBackground } from '../data/swatch.js'
import { ArrowRightIcon, ChevronLeftIcon } from '../components/Icons.jsx'
import './Models.css'

const CATEGORIES = [
  { id: 'all', label: 'All models' },
  { id: 'motorcycles', label: 'Motorcycles' },
  { id: 'scooters', label: 'Scooters' },
  { id: 'electric', label: 'Electric' },
]

const seriesOf = (m) => (m.name.startsWith('TVS ') ? m.name.slice(4) : m.name.split(' ')[0])
const whatsapp = (text) => `https://wa.me/${PHONE.replace('+', '')}?text=${encodeURIComponent(text)}`

export default function Models() {
  const { category = 'all' } = useParams()
  const { hash } = useLocation()
  const [fuel, setFuel] = useState([])
  const [series, setSeries] = useState([])
  const [open, setOpen] = useState({ category: true, series: true, fuel: true })

  const inCategory = useMemo(
    () => (category === 'all' ? models : models.filter((m) => m.category === category)),
    [category],
  )

  // reset filters that no longer apply when switching category
  useEffect(() => {
    setSeries([])
    setFuel([])
    window.scrollTo({ top: 0 })
  }, [category])

  const shown = inCategory.filter(
    (m) => (!fuel.length || fuel.includes(m.fuel)) && (!series.length || series.includes(seriesOf(m))),
  )

  const count = (list, fn) => list.reduce((acc, m) => ((acc[fn(m)] = (acc[fn(m)] || 0) + 1), acc), {})
  const seriesCounts = count(inCategory, seriesOf)
  const fuelCounts = count(inCategory, (m) => m.fuel)
  const catCounts = count(models, (m) => m.category)

  // arriving from the menu with #model-slug: bring that card into view and flash it
  useEffect(() => {
    if (!hash) return
    const el = document.getElementById(hash.slice(1))
    if (!el) return
    setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('is-flash')
      setTimeout(() => el.classList.remove('is-flash'), 1800)
    }, 350)
  }, [hash, category])

  if (!CATEGORIES.some((c) => c.id === category)) return <Navigate to="/models/all" replace />
  const title = CATEGORIES.find((c) => c.id === category).label
  const toggle = (list, set, v) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v])
  const filtered = fuel.length || series.length

  return (
    <main className="models-page">
      <div className="models-top">
        <div>
          <Link className="models-back" to="/">
            <ChevronLeftIcon width={18} height={18} /> Home
          </Link>
          <h1 className="models-title">{title}</h1>
        </div>
        <div className="models-help">
          <p>Not sure which one is right for you?</p>
          <a className="m-btn m-btn-dark" href={whatsapp('Hi Global TVS, can you help me choose a two-wheeler?')} target="_blank" rel="noreferrer">
            Talk to our team
          </a>
        </div>
      </div>

      <div className="models-layout">
        <aside className="filters" aria-label="Filters">
          <FilterGroup title="Category" open={open.category} onToggle={() => setOpen({ ...open, category: !open.category })}>
            {CATEGORIES.map((c) => (
              <Link key={c.id} to={`/models/${c.id}`} className={`f-row${category === c.id ? ' is-on' : ''}`}>
                <span className="f-radio" />
                {c.label}
                <span className="f-count">({c.id === 'all' ? models.length : catCounts[c.id] || 0})</span>
              </Link>
            ))}
          </FilterGroup>

          <FilterGroup title="Series" open={open.series} onToggle={() => setOpen({ ...open, series: !open.series })}>
            {Object.entries(seriesCounts).map(([s, n]) => (
              <label key={s} className={`f-row${series.includes(s) ? ' is-on' : ''}`}>
                <input type="checkbox" checked={series.includes(s)} onChange={() => toggle(series, setSeries, s)} />
                <span className="f-box" />
                {s}
                <span className="f-count">({n})</span>
              </label>
            ))}
          </FilterGroup>

          <FilterGroup title="Fuel" open={open.fuel} onToggle={() => setOpen({ ...open, fuel: !open.fuel })}>
            {Object.entries(fuelCounts).map(([f, n]) => (
              <label key={f} className={`f-row${fuel.includes(f) ? ' is-on' : ''}`}>
                <input type="checkbox" checked={fuel.includes(f)} onChange={() => toggle(fuel, setFuel, f)} />
                <span className="f-box" />
                {f}
                <span className="f-count">({n})</span>
              </label>
            ))}
          </FilterGroup>

          {filtered ? (
            <button className="f-clear" onClick={() => (setFuel([]), setSeries([]))}>
              Clear filters
            </button>
          ) : null}
        </aside>

        <section className="models-results" aria-live="polite">
          <p className="models-count">
            {shown.length} {shown.length === 1 ? 'model' : 'models'}
          </p>
          {/* key replays the entrance animation whenever the selection changes */}
          <div className="models-grid" key={`${category}|${fuel}|${series}`}>
            {shown.map((m, i) => (
              <ModelCard key={m.slug} model={m} index={i} />
            ))}
          </div>
          {!shown.length && <p className="models-empty">No models match these filters.</p>}
        </section>
      </div>
    </main>
  )
}

function FilterGroup({ title, open, onToggle, children }) {
  return (
    <div className={`f-group${open ? ' is-open' : ''}`}>
      <button className="f-head" onClick={onToggle} aria-expanded={open}>
        {title}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M6 15l6-6 6 6" />
        </svg>
      </button>
      <div className="f-body">
        <div>{children}</div>
      </div>
    </div>
  )
}

function ModelCard({ model: m, index }) {
  const [colour, setColour] = useState(m.colours[0] || null)
  const [preview, setPreview] = useState(null)
  const [showVariants, setShowVariants] = useState(false)
  const current = preview || colour
  const image = current?.image || m.image
  const categoryLabel = { motorcycles: 'Motorcycle', scooters: 'Scooter', electric: 'Electric' }[m.category]

  return (
    <article id={`model-${m.slug}`} className="mcard" style={{ '--i': index }}>
      <div className="mcard-img">
        {/* key: crossfade + slide-in whenever the colour changes */}
        <img key={image} src={image} alt={`${m.name}${current ? ` in ${prettyColour(current.name)}` : ''}`} loading={index < 4 ? 'eager' : 'lazy'} />
      </div>

      <h2 className="mcard-name">
        {/* the stretched link makes the photo + name open the model page */}
        <Link to={`/model/${m.slug}`} className="mcard-link">
          {m.name}
        </Link>
      </h2>
      <div className="mcard-tags">
        <span className="tag tag-dark">{categoryLabel}</span>
        <span className="tag">{m.fuel}</span>
        <span className="tag">
          {m.variants.length} {m.variants.length === 1 ? 'variant' : 'variants'}
        </span>
      </div>

      {m.colours.length > 0 && (
        <div className="mcard-colours">
          <p className="mcard-colour-name">{prettyColour(current.name)}</p>
          <div className="swatches" onMouseLeave={() => setPreview(null)}>
            {m.colours.map((c) => (
              <button
                key={c.name}
                className={`swatch${colour?.name === c.name ? ' is-on' : ''}`}
                style={{ background: swatchBackground(c.name) }}
                onClick={() => setColour(c)}
                onMouseEnter={() => setPreview(c)}
                aria-label={prettyColour(c.name)}
                aria-pressed={colour?.name === c.name}
                title={prettyColour(c.name)}
              />
            ))}
          </div>
        </div>
      )}

      <dl className="mcard-stats">
        <div>
          <dt>Variants</dt>
          <dd>{m.variants.length}</dd>
        </div>
        <div>
          <dt>Colours</dt>
          <dd>{m.colours.length || '–'}</dd>
        </div>
        <div>
          <dt>Fuel</dt>
          <dd>{m.fuel}</dd>
        </div>
      </dl>

      {m.variants.length > 0 && (
        <div className={`mcard-variants${showVariants ? ' is-open' : ''}`}>
          <button onClick={() => setShowVariants(!showVariants)} aria-expanded={showVariants}>
            {showVariants ? 'Hide variants' : 'See all variants'}
          </button>
          <div className="mcard-variants-body">
            <ul>
              {m.variants.map((v) => (
                <li key={v.name}>
                  <span>{v.name}</span>
                  <small>
                    {v.colours.length} {v.colours.length === 1 ? 'colour' : 'colours'}
                  </small>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="mcard-actions">
        <Link className="m-btn m-btn-dark" to={`/model/${m.slug}`}>
          Explore model <ArrowRightIcon width={18} height={18} />
        </Link>
        <a className="m-btn" href={whatsapp(`Hi Global TVS, I'd like to book a test ride of the ${m.name}.`)} target="_blank" rel="noreferrer">
          Book a test ride
        </a>
      </div>
    </article>
  )
}
