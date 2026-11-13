import { useCallback, useEffect, useRef, useState } from 'react'
import { heroSlides } from '../data/heroSlides.js'
import { ArrowDownIcon, PauseIcon, PlayIcon, SoundOffIcon, SoundOnIcon } from './Icons.jsx'
import './Hero.css'

export default function Hero() {
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [muted, setMuted] = useState(true)
  const [onScreen, setOnScreen] = useState(true)
  const sectionRef = useRef(null)
  const videoRefs = useRef([])
  const barRefs = useRef([])

  // Pause the video while it's scrolled out of view, so it doesn't slow the rest of the page.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.05 })
    io.observe(sectionRef.current)
    return () => io.disconnect()
  }, [])

  const goTo = useCallback((i) => {
    setActive((i + heroSlides.length) % heroSlides.length)
  }, [])

  // Switch slides: rewind the others, start the active one.
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return
      if (i !== active) {
        v.pause()
        v.currentTime = 0
        barRefs.current[i]?.style.setProperty('--p', 0)
      }
    })
  }, [active])

  // Play / pause and sound for the active video.
  useEffect(() => {
    const v = videoRefs.current[active]
    if (!v) return
    v.muted = muted
    if (playing && onScreen) {
      v.play().catch(() => setPlaying(false)) // browser blocked autoplay
    } else {
      v.pause()
    }
  }, [active, playing, muted, onScreen])

  // Smooth progress bar for the active slide.
  useEffect(() => {
    let raf
    const tick = () => {
      const v = videoRefs.current[active]
      const bar = barRefs.current[active]
      if (v && bar && v.duration) bar.style.setProperty('--p', v.currentTime / v.duration)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])

  const slide = heroSlides[active]

  return (
    <section ref={sectionRef} className="hero" aria-roledescription="carousel" aria-label="Featured models">
      <div className="hero-media">
        {heroSlides.map((s, i) => (
          <video
            key={s.id}
            ref={(el) => (videoRefs.current[i] = el)}
            className={`hero-video${i === active ? ' is-active' : ''}`}
            src={s.video}
            poster={s.poster}
            muted
            playsInline
            preload={i === active ? 'auto' : 'metadata'}
            onEnded={() => goTo(i + 1)}
            aria-hidden="true"
          />
        ))}
        <div className="hero-shade" />
      </div>

      <div className="hero-content" key={slide.id}>
        <h1 className="hero-title">{slide.title}</h1>
        <a className="glass-btn" href={slide.link}>
          Discover more
        </a>
      </div>

      <a className="hero-scroll" href="#next" aria-label="Scroll down">
        <ArrowDownIcon />
      </a>

      <div className="hero-controls">
        <div className="hero-tabs" role="tablist" aria-label="Choose video">
          {heroSlides.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={i === active}
              aria-label={s.title.replace(/\.$/, '')}
              className={`hero-tab${i === active ? ' is-active' : ''}`}
              onClick={() => {
                goTo(i)
                setPlaying(true)
              }}
            >
              <span ref={(el) => (barRefs.current[i] = el)} className="hero-tab-bar" />
            </button>
          ))}
        </div>

        <button
          className="round-btn"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
        >
          {muted ? <SoundOffIcon /> : <SoundOnIcon />}
        </button>
        <button
          className="round-btn"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? 'Pause video' : 'Play video'}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>
    </section>
  )
}
