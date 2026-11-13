import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import FindUs from '../components/FindUs.jsx'
import Hero from '../components/Hero.jsx'
import Profile from '../components/Profile.jsx'
import Reviews from '../components/Reviews.jsx'
import Stats from '../components/Stats.jsx'

export default function Home() {
  const { hash } = useLocation()

  // arriving from another page with /#about, /#contact…: scroll to that section once it exists
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 })
      return
    }
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 120)
    return () => clearTimeout(t)
  }, [hash])

  return (
    <>
      <Hero />
      <Stats id="next" />
      <Profile />
      <FindUs />
      <Reviews />
    </>
  )
}
