import { useEffect, useMemo, useRef, useState } from 'react'
import { reviews } from '../data/reviews.js'
import { ArrowRightIcon } from './Icons.jsx'
import './Reviews.css'

/*
  Slot-machine reels: slanted columns of customer photos drift in alternating
  directions, spin up, then brake one by one. The middle reel always stops on
  the chosen customer, whose photo pops out while their review appears on the right.
*/

const COLS = 3
const PICK_COL = 1 // middle reel lands on the chosen review
const CRUISE = 26 // px/s idle drift
const SPIN = 1700 // px/s top speed
const SHOW_MS = 2000 // how long each review stays up before the next spin
const SPIN_UP_MS = 1000 // full-speed spin…
const BRAKE_MS = 2000 // …then braking: whole spin = 3 seconds
const TINTS = ['#f1e9e4', '#e6edf3', '#eef0e6', '#f3e8ee', '#e9e8f3', '#e8f1ef']

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

export default function Reviews() {
  const sectionRef = useRef(null)
  const windowRef = useRef(null)
  const reelsRef = useRef(null)
  const popRef = useRef(null)
  const colRefs = useRef([])
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState('cruise') // cruise | spin | stop | show
  const [tile, setTile] = useState(() => (window.innerWidth < 760 ? 150 : 236))

  const R = reviews.length
  const GAP = Math.round(tile * 0.08)
  const STEP = tile + GAP
  const PER_COL = Math.max(R, 8)
  const L = PER_COL * STEP // length of one loop of a reel

  // each reel shows the reviews in a different order
  const columns = useMemo(
    () =>
      Array.from({ length: COLS }, (_, c) =>
        Array.from({ length: PER_COL }, (_, i) => (i + c * 3) % R),
      ),
    [R, PER_COL],
  )

  // live animation state, kept outside React for 60fps
  const sim = useRef(null)
  if (!sim.current) {
    sim.current = {
      cols: Array.from({ length: COLS }, (_, c) => ({ y: -c * STEP * 1.7, v: 0, dir: c % 2 ? 1 : -1, anim: null })),
      phase: 'cruise',
      visible: false,
      hover: false,
      center: 0,
      target: 0,
      pickedEl: null,
      timer: null,
    }
  }

  useEffect(() => {
    const onResize = () => setTile(window.innerWidth < 760 ? 150 : 236)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  /* ---------- main loop ---------- */
  useEffect(() => {
    if (!R) return
    const s = sim.current
    let raf
    let last = performance.now()

    const measure = () => {
      s.center = (reelsRef.current?.clientHeight || 0) / 2
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(reelsRef.current)

    const render = () => {
      s.cols.forEach((col, c) => {
        const el = colRefs.current[c]
        if (!el) return
        const t = (((col.y % L) + L) % L) - L
        el.style.transform = `translate3d(0, ${t}px, 0)`
      })
    }

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (s.visible) {
        let stillStopping = false
        s.cols.forEach((col) => {
          if (col.anim) {
            const p = Math.min(1, (now - col.anim.t0) / col.anim.T)
            col.y = col.anim.from + (col.anim.to - col.anim.from) * easeOutCubic(p)
            if (p < 1) stillStopping = true
            else {
              col.anim = null
              col.v = 0
            }
          } else if (s.phase === 'spin') {
            col.v = Math.min(SPIN, col.v + SPIN * dt * 3) // reaches top speed in ~0.33s
            col.y += col.dir * col.v * dt
          } else if (s.phase === 'cruise') {
            col.v = CRUISE
            col.y += col.dir * col.v * dt
          }
        })
        if (s.phase === 'stop' && !stillStopping) reveal()
        if (s.phase !== 'show') render() // nothing moves while a review is shown
      }
      raf = requestAnimationFrame(tick)
    }

    // pick the stopping point for each reel, at or beyond the distance it needs to brake
    const brake = () => {
      s.phase = 'stop'
      setPhase('stop')
      const now = performance.now()
      s.cols.forEach((col, c) => {
        const v = Math.max(col.v, 300)
        // middle reel lands last, exactly at the 3-second mark; the others settle just before
        const T = c === PICK_COL ? BRAKE_MS : 1200 + c * 150
        const minTravel = (v * T) / 3 // matches current speed at the start of the ease
        let ideal // rendering offset that centres the wanted tile
        let period
        if (c === PICK_COL) {
          const p = columns[c].indexOf(s.target)
          ideal = s.center - tile / 2 - (p + PER_COL) * STEP
          period = L
        } else {
          ideal = s.center - tile / 2
          period = STEP
        }
        // smallest y ahead of the reel (in its direction) that is ≡ ideal (mod period) and ≥ minTravel away
        const want = col.y + col.dir * minTravel
        const k = col.dir > 0 ? Math.ceil((want - ideal) / period) : Math.floor((want - ideal) / period)
        col.anim = { from: col.y, to: ideal + k * period, t0: now, T }
      })
    }

    /*
      Pop-out: a separate card on its own GPU layer lifts off from the chosen tile and
      straightens up. Only transform and opacity animate, so nothing is repainted.
    */
    const showPop = (tileEl, r) => {
      const pop = popRef.current
      const win = windowRef.current
      if (!pop || !win) return
      pop.querySelector('img').src = r.photo
      pop.querySelector('.pop-name').textContent = r.name
      pop.querySelector('.pop-branch').textContent = r.branch || ''
      const w = win.getBoundingClientRect()
      const b = tileEl?.getBoundingClientRect()
      const dx = b ? b.left + b.width / 2 - (w.left + w.width / 2) : 0
      const dy = b ? b.top + b.height / 2 - (w.top + w.height / 2) : 0
      pop.classList.add('is-on')
      if (tileEl) tileEl.style.visibility = 'hidden' // the card has "lifted off" this tile
      if (reducedMotion()) return
      pop.animate(
        [
          { transform: `translate(${dx}px, ${dy}px) rotate(14deg) scale(${1 / 1.5})` },
          { transform: 'none' },
        ],
        { duration: 700, easing: 'cubic-bezier(0.34, 1.35, 0.5, 1)' },
      )
      pop.querySelector('figcaption').animate(
        [
          { opacity: 0, transform: 'translateY(10px)' },
          { opacity: 1, transform: 'none' },
        ],
        { duration: 450, delay: 300, easing: 'ease-out', fill: 'backwards' },
      )
    }

    const hidePop = () => {
      const pop = popRef.current
      const tileEl = s.pickedEl
      s.pickedEl = null
      if (!pop?.classList.contains('is-on')) return
      const done = () => {
        pop.classList.remove('is-on')
        if (tileEl) tileEl.style.visibility = ''
      }
      if (reducedMotion()) return done()
      pop.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(0.85)' }], {
        duration: 260,
        easing: 'ease-in',
      }).onfinish = done
    }

    const reveal = () => {
      s.phase = 'show'
      setPhase('show')
      setIndex(s.target)
      // the tile now sitting in the centre of the middle reel pops out
      const col = s.cols[PICK_COL]
      const t = (((col.y % L) + L) % L) - L
      const j = Math.round((s.center - tile / 2 - t) / STEP)
      s.pickedEl = colRefs.current[PICK_COL]?.children[j] || null
      showPop(s.pickedEl, reviews[s.target])
      schedule(SHOW_MS)
    }

    const spinTo = (target) => {
      clearTimeout(s.timer)
      hidePop()
      s.target = target
      if (reducedMotion()) {
        setIndex(target)
        setPhase('show')
        schedule(SHOW_MS)
        return
      }
      s.phase = 'spin'
      setPhase('spin')
      s.timer = setTimeout(brake, SPIN_UP_MS)
    }

    const schedule = (ms) => {
      clearTimeout(s.timer)
      s.timer = setTimeout(function next() {
        if (!s.visible || s.hover) {
          s.timer = setTimeout(next, 800) // wait while off-screen or being read
          return
        }
        spinTo((s.target + 1) % R)
      }, ms)
    }

    s.spinTo = spinTo
    render()
    raf = requestAnimationFrame(tick)

    // start spinning when the section first comes into view
    let started = false
    const io = new IntersectionObserver(
      ([e]) => {
        s.visible = e.isIntersecting
        if (e.isIntersecting && !started) {
          started = true
          setTimeout(() => spinTo(0), 500)
        }
      },
      { threshold: 0.35 },
    )
    io.observe(sectionRef.current)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(s.timer)
      ro.disconnect()
      io.disconnect()
    }
  }, [R, L, STEP, PER_COL, tile, columns])

  // The reel tiles never change between spins, so build them once. Re-rendering ~50 tiles
  // every time a review appears was part of the stutter.
  const reelTiles = useMemo(
    () =>
      columns.map((list, c) => (
        <div key={c} ref={(el) => (colRefs.current[c] = el)} className={`reel${c === PICK_COL ? ' is-pick' : ''}`}>
          {[0, 1].flatMap((copy) =>
            list.map((ri, i) => {
              const r = reviews[ri]
              return (
                <figure
                  key={`${copy}-${i}`}
                  className={`tile${r.placeholder ? ' is-placeholder' : ''}`}
                  style={{ '--tint': TINTS[(ri + c) % TINTS.length] }}
                >
                  <img src={r.photo} alt="" decoding="async" draggable="false" />
                </figure>
              )
            }),
          )}
        </div>
      )),
    [columns],
  )

  if (!R) return null
  const review = reviews[index]
  const busy = phase === 'spin' || phase === 'stop'

  return (
    <section ref={sectionRef} id="reviews" className="reviews" aria-labelledby="reviews-title">
      <div className="reviews-head">
        <p className="reviews-eyebrow">Customer reviews</p>
        <h2 id="reviews-title" className="reviews-title">
          Riders who chose Global&nbsp;TVS.
        </h2>
      </div>

      <div className="reviews-stage">
        <div
          ref={windowRef}
          className={`reels-window is-${phase}`}
          style={{ '--tile': `${tile}px`, '--gap': `${GAP}px` }}
          aria-hidden="true"
        >
          <div ref={reelsRef} className="reels">
            {reelTiles}
          </div>
          <div className="reels-dim" />
          <div className="reels-fade" />
          <figure ref={popRef} className="pop">
            <img src={reviews[0]?.photo} alt="" draggable="false" />
            <figcaption>
              <span className="pop-name" />
              <small className="pop-branch" />
            </figcaption>
          </figure>
        </div>

        <div className="review-panel" onMouseEnter={() => (sim.current.hover = true)} onMouseLeave={() => (sim.current.hover = false)}>
          <div className={`review-card${busy ? ' is-hidden' : ''}`} key={review.id} aria-live="polite">
            <div className="review-top">
              <span className="review-stars" aria-label={`${review.rating} out of 5 stars`}>
                {'★★★★★'.slice(0, review.rating)}
                <span className="review-stars-off">{'★★★★★'.slice(review.rating)}</span>
              </span>
              <span className="review-source">Google review</span>
              {review.sample && <span className="review-sample">Sample</span>}
            </div>
            <blockquote className="review-text">{review.text}</blockquote>
            <p className="review-who">
              <strong>{review.name}</strong>
              {review.branch && <span>{review.branch}</span>}
            </p>
          </div>

          <div className="review-foot">
            <span className="review-count">
              {String(index + 1).padStart(2, '0')} <em>/ {String(R).padStart(2, '0')}</em>
            </span>
            <button className="review-next" onClick={() => sim.current.spinTo?.((sim.current.target + 1) % R)} disabled={busy}>
              Spin next review <ArrowRightIcon width={18} height={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
