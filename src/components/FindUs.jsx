import { useEffect, useRef, useState } from 'react'
import { branches } from '../data/branches.js'
import { PHONE } from '../data/contact.js'
import { ArrowRightIcon, PhoneIcon } from './Icons.jsx'
import './FindUs.css'

// Free vector tiles (OpenStreetMap data), no API key needed.
const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function FindUs() {
  const sectionRef = useRef(null)
  const mapEl = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef({})
  const stageRef = useRef(null)
  const orbit = useRef({ on: false, visible: false })
  const ready = useRef(false)
  const pending = useRef(null) // branch asked for before the map finished loading
  const [active, setActive] = useState(branches[0].id)
  const [status, setStatus] = useState('idle') // idle | loading | ready | failed

  /* ---------- "show this showroom" from anywhere on the page (e.g. the profile chips) ---------- */
  useEffect(() => {
    const onShow = (e) => {
      const id = e.detail
      if (!branches.some((b) => b.id === id)) return
      setActive(id)
      highlight(id)
      if (mapRef.current) mapRef.current.stop()
      orbit.current.on = false
      stageRef.current.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' })
      if (ready.current) afterScroll(() => select(id))
      else pending.current = id // the intro flight will go here instead
    }
    window.addEventListener('show-branch', onShow)
    return () => window.removeEventListener('show-branch', onShow)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ---------- load the map library only when the section gets close ---------- */
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        orbit.current.visible = e.isIntersecting
        if (e.isIntersecting && status === 'idle') setStatus('loading')
        if (e.isIntersecting) startOrbit()
      },
      { rootMargin: '300px 0px' },
    )
    io.observe(sectionRef.current)
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  useEffect(() => {
    if (status !== 'loading') return
    let cancelled = false

    ;(async () => {
      try {
        const [{ default: maplibregl }] = await Promise.all([
          import('maplibre-gl'),
          import('maplibre-gl/dist/maplibre-gl.css'),
        ])
        if (cancelled) return

        const all = new maplibregl.LngLatBounds()
        branches.forEach((b) => all.extend(b.lngLat))

        const map = new maplibregl.Map({
          container: mapEl.current,
          style: STYLE_URL,
          bounds: all,
          fitBoundsOptions: { padding: 80 },
          pitch: 0,
          bearing: 0,
          maxPitch: 75,
          attributionControl: { compact: true },
          cooperativeGestures: true, // page scroll isn't hijacked; ctrl/two-finger to move the map
        })
        mapRef.current = map
        map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right')

        map.on('style.load', () => {
          // swap the flat building footprints for 3D extruded buildings
          if (map.getLayer('building')) map.removeLayer('building')
          map.addLayer(
            {
              id: 'buildings-3d',
              type: 'fill-extrusion',
              source: 'openmaptiles',
              'source-layer': 'building',
              minzoom: 13,
              paint: {
                'fill-extrusion-color': [
                  'interpolate',
                  ['linear'],
                  ['coalesce', ['get', 'render_height'], 8],
                  0, '#e6e7eb',
                  30, '#d9dbe1',
                  80, '#cfd2da',
                ],
                'fill-extrusion-height': [
                  'interpolate', ['linear'], ['zoom'],
                  13, 0,
                  14.5, ['coalesce', ['get', 'render_height'], 8],
                ],
                'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
                'fill-extrusion-opacity': 0.92,
              },
            },
            firstSymbolLayer(map),
          )
          map.setLight({ anchor: 'viewport', color: '#ffffff', intensity: 0.35, position: [1.4, 210, 35] })
        })

        // red pins with the area name
        branches.forEach((b) => {
          const el = document.createElement('button')
          el.className = 'map-pin'
          el.type = 'button'
          el.setAttribute('aria-label', `Show ${b.area} on the map`)
          const dot = document.createElement('span')
          dot.className = 'map-pin-dot'
          const label = document.createElement('span')
          label.className = 'map-pin-label'
          label.textContent = b.area
          el.append(dot, label)
          el.addEventListener('click', () => select(b.id))
          markersRef.current[b.id] = new maplibregl.Marker({ element: el, anchor: 'left', offset: [-9, 0] })
            .setLngLat(b.lngLat)
            .addTo(map)
        })

        // any touch from the visitor stops the automatic orbit
        ;['mousedown', 'touchstart', 'wheel'].forEach((ev) =>
          map.on(ev, () => {
            orbit.current.on = false
          }),
        )
        map.on('moveend', () => {
          if (orbit.current.on) spin()
        })

        map.once('load', () => {
          setStatus('ready')
          ready.current = true
          // keep the required map credits folded into the small ⓘ button
          mapEl.current
            ?.querySelector('.maplibregl-ctrl-attrib')
            ?.classList.remove('maplibregl-compact-show')
          // cinematic intro: from above the city down into the first showroom
          // (or the one a visitor already picked from the profile chips)
          const first = branches.find((b) => b.id === pending.current) || branches[0]
          pending.current = null
          setActive(first.id)
          highlight(first.id)
          setTimeout(() => flyTo(first, 5200), 600)
        })
      } catch (err) {
        console.error('3D map failed to load', err)
        if (!cancelled) setStatus('failed')
      }
    })()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  // clean up on unmount
  useEffect(() => () => mapRef.current?.remove(), [])

  /* ---------- camera moves ---------- */

  function spin() {
    const map = mapRef.current
    if (!map || !orbit.current.on || !orbit.current.visible) return
    map.easeTo({ bearing: map.getBearing() + 24, duration: 8000, easing: (t) => t })
  }

  function startOrbit() {
    if (reducedMotion() || !mapRef.current || !orbit.current.on) return
    if (!mapRef.current.isMoving()) spin()
  }

  function flyTo(b, duration = 3200) {
    const map = mapRef.current
    if (!map) return
    orbit.current.on = !reducedMotion()
    const opts = { center: b.lngLat, zoom: 16.4, pitch: 62, bearing: -28 }
    if (reducedMotion()) map.jumpTo(opts)
    else map.flyTo({ ...opts, duration, curve: 1.6, essential: true })
  }

  function highlight(id) {
    Object.entries(markersRef.current).forEach(([k, m]) => m.getElement().classList.toggle('is-active', k === id))
  }

  function select(id) {
    setActive(id)
    highlight(id)
    flyTo(branches.find((b) => b.id === id))
  }

  /* ---------- markup ---------- */

  return (
    <section ref={sectionRef} id="contact" className="findus" aria-labelledby="findus-title">
      <div className="findus-head">
        <p className="findus-eyebrow">Find us</p>
        <h2 id="findus-title" className="findus-title">
          {branches.length} showrooms across Bengaluru.
        </h2>
      </div>

      <div ref={stageRef} className="findus-stage">
        <div ref={mapEl} className={`findus-map is-${status}`} aria-label="3D map of Global TVS showrooms" role="region" />
        {status !== 'ready' && status !== 'failed' && <div className="findus-loading">Loading 3D map…</div>}
        {status === 'failed' && (
          <div className="findus-loading">The 3D map couldn’t load on this device. Use the Directions buttons instead.</div>
        )}

        <div className="findus-panel">
          <ul className="branch-list">
            {branches.map((b) => (
              <li key={b.id}>
                <div className={`branch${active === b.id ? ' is-active' : ''}`}>
                  <button className="branch-main" onClick={() => select(b.id)} aria-pressed={active === b.id}>
                    <span className="branch-area">{b.area}</span>
                    {b.rating && (
                      <span className="branch-rating">
                        <span className="branch-star">★</span> {b.rating.toFixed(1)}
                        <span className="branch-reviews">({b.reviews.toLocaleString('en-IN')})</span>
                      </span>
                    )}
                    <span className="branch-address">{b.address}</span>
                  </button>
                  <div className="branch-actions">
                    <a href={b.mapsUrl} target="_blank" rel="noreferrer">
                      Directions <ArrowRightIcon width={16} height={16} />
                    </a>
                    <a href={`tel:${PHONE}`}>
                      <PhoneIcon width={16} height={16} /> Call
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

// run fn once the smooth page scroll has finished (or after 1s if the browser doesn't report it)
function afterScroll(fn) {
  let done = false
  const run = () => {
    if (done) return
    done = true
    window.removeEventListener('scrollend', run)
    fn()
  }
  window.addEventListener('scrollend', run, { once: true })
  setTimeout(run, 1000)
}

function firstSymbolLayer(map) {
  return map.getStyle().layers.find((l) => l.type === 'symbol')?.id
}
