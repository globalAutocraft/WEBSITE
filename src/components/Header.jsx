import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { MenuIcon, PhoneIcon, PinIcon, UserIcon } from './Icons.jsx'
import MenuDrawer from './MenuDrawer.jsx'
import './Header.css'

import { PHONE } from '../data/contact.js'

export default function Header() {
  const { user } = useAuth()
  const { pathname } = useLocation() // solid header on inner pages, which have a light background
  const [menuOpen, setMenuOpen] = useState(false)
  const [pane, setPane] = useState('motorcycles')
  const [showSide, setShowSide] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // "Menu" → models on the right; account icon → login on the right
  const openAs = (v) => {
    setPane(v === 'account' ? 'account' : 'motorcycles')
    setShowSide(v === 'account')
    setMenuOpen(true)
  }
  const close = useCallback(() => setMenuOpen(false), [])

  // other sections (e.g. the footer) can open the menu on a given pane
  useEffect(() => {
    const onOpen = (e) => {
      setPane(e.detail || 'motorcycles')
      setShowSide(true)
      setMenuOpen(true)
    }
    window.addEventListener('open-menu', onOpen)
    return () => window.removeEventListener('open-menu', onOpen)
  }, [])

  return (
    <>
      <header className={`site-header${scrolled || pathname !== '/' ? ' is-solid' : ''}`}>
        <button className="header-menu" onClick={() => openAs('menu')} aria-expanded={menuOpen}>
          <MenuIcon />
          <span>Menu</span>
        </button>

        <Link className="header-logo" to="/" aria-label="Global Autocraft LLP, home">
          GLOBAL AUTOCRAFT LLP
        </Link>

        <div className="header-actions">
          <a className="icon-btn" href={`tel:${PHONE}`} aria-label="Call us">
            <PhoneIcon />
          </a>
          <Link className="icon-btn is-wide-only" to="/contact" aria-label="Contact us">
            <PinIcon />
          </Link>
          <button
            className={`icon-btn${user ? ' is-signed-in' : ''}`}
            onClick={() => openAs('account')}
            aria-label={user ? 'My account' : 'Sign in'}
          >
            <UserIcon />
          </button>
        </div>
      </header>

      <MenuDrawer
        open={menuOpen}
        pane={pane}
        showSide={showSide}
        onPaneChange={setPane}
        onShowSide={setShowSide}
        onClose={close}
      />
    </>
  )
}
