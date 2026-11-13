import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

/*
  Buttery mouse-wheel scrolling (Lenis). Each wheel step eases to a stop instead of
  jumping. Touch screens keep their native scrolling, which is already smooth.
  Visitors who ask for reduced motion get normal scrolling.
*/
let lenis = null

export function startSmoothScroll() {
  if (lenis || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  lenis = new Lenis({
    lerp: 0.085, // lower = smoother/longer glide
    wheelMultiplier: 1,
    smoothWheel: true,
  })
  const raf = (time) => {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)

  // same-page #links glide to their section (stopping below the header via scroll-margin-top)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]')
    if (!a || e.defaultPrevented || a.getAttribute('href') === '#') return
    const target = document.getElementById(a.getAttribute('href').slice(1))
    if (!target) return
    e.preventDefault()
    lenis.scrollTo(target, { duration: 1.4 }) // Lenis already respects the section's scroll-margin-top
    history.replaceState(null, '', a.getAttribute('href'))
  })
}

// Used while the menu is open, so the page behind it doesn't move.
export const pauseScroll = () => lenis?.stop()
export const resumeScroll = () => lenis?.start()

// Jump straight to the top of a new page (no leftover glide from the last page).
export function scrollToTopNow() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
  else window.scrollTo({ top: 0 })
}
