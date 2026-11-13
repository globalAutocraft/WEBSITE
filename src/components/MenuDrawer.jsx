import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { wa } from '../data/contact.js'
import { pauseScroll, resumeScroll } from '../lib/smoothScroll.js'
import AccountPanel from './AccountPanel.jsx'
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, UserIcon } from './Icons.jsx'
import CareersPanel from './CareersPanel.jsx'
import ServicesPanel from './ServicesPanel.jsx'
import VehicleList from './VehicleList.jsx'
import './MenuDrawer.css'

// Items with `pane` open content on the right; items with `href` are plain links.
const items = [
  { label: 'Motorcycles', pane: 'motorcycles' },
  { label: 'Scooters', pane: 'scooters' },
  { label: 'Electric', pane: 'electric' },
  { label: 'Book a Test Ride', href: wa('Hi Global TVS, I would like to book a test ride.'), external: true },
  { label: 'Service', pane: 'services' },
  { label: 'Find Us', to: '/#contact' },
  { label: 'Contact Us', to: '/contact' },
  { label: 'About Us', to: '/about' },
  { label: 'Careers', pane: 'careers' },
]

/*
  pane      – what the right-hand side shows: 'motorcycles' | 'scooters' | 'electric' | 'account'
  showSide  – phones only: true when the right-hand pane has slid in over the menu
*/
export default function MenuDrawer({ open, pane, showSide, onPaneChange, onShowSide, onClose }) {
  const { user } = useAuth()
  const closeRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    pauseScroll() // smooth-scroll would otherwise keep moving the page behind the menu
    if (pane !== 'account') closeRef.current?.focus({ preventScroll: true })
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      resumeScroll()
    }
    // focus only when the drawer opens, not on every pane switch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onClose])

  const navigate = useNavigate()
  // tabs that preview on hover and open a full page on click
  const PAGE_FOR = {
    motorcycles: '/models/motorcycles',
    scooters: '/models/scooters',
    electric: '/models/electric',
    services: '/services',
  }
  const MODEL_PANES = Object.keys(PAGE_FOR)
  const canHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches

  const choose = (p) => {
    onPaneChange(p)
    onShowSide(true)
  }

  // Hover previews on the right; click opens the full page.
  // On touch screens (no hover) the first tap shows the preview, which has an "All…" link.
  const clickTab = (p) => {
    if (PAGE_FOR[p] && (canHover || (pane === p && showSide))) {
      onClose()
      navigate(PAGE_FOR[p])
    } else choose(p)
  }

  return (
    <div className={`menu-layer${open ? ' is-open' : ''}${showSide ? ' show-side' : ''}`} aria-hidden={!open}>
      <div className="menu-backdrop" onClick={onClose} />

      <div className="menu-panel" inert={!open} data-lenis-prevent>
        <nav className="menu-nav" aria-label="Main menu">
          <ul className="menu-list">
            {items.map((item, i) => (
              <li key={item.label} style={{ '--i': i }}>
                {item.pane ? (
                  <button
                    className={`menu-item${pane === item.pane ? ' is-active' : ''}`}
                    onClick={() => clickTab(item.pane)}
                    onMouseEnter={() => canHover && MODEL_PANES.includes(item.pane) && onPaneChange(item.pane)}
                    aria-pressed={pane === item.pane}
                  >
                    {item.label}
                    <ChevronRightIcon />
                  </button>
                ) : item.to ? (
                  <Link className="menu-item" to={item.to} onClick={onClose}>
                    {item.label}
                    <ChevronRightIcon />
                  </Link>
                ) : (
                  <a
                    className="menu-item"
                    href={item.href}
                    onClick={onClose}
                    {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                  >
                    {item.label}
                    <ChevronRightIcon />
                  </a>
                )}
              </li>
            ))}
          </ul>

          <button
            className={`menu-account-btn${pane === 'account' ? ' is-active' : ''}`}
            onClick={() => choose('account')}
            aria-pressed={pane === 'account'}
          >
            <span className={`menu-avatar${user ? ' is-signed-in' : ''}`}>
              <UserIcon width={20} height={20} />
            </span>
            {user ? 'My Account' : 'Account'}
            <ChevronRightIcon />
          </button>
        </nav>

        <aside
          className="menu-side"
          aria-label={{ account: 'Account', careers: 'Careers', services: 'Services' }[pane] || 'Models'}
        >
          <button className="menu-back" onClick={() => onShowSide(false)}>
            <ChevronLeftIcon width={20} height={20} />
            Menu
          </button>
          {pane === 'account' ? (
            <AccountPanel autoFocus={open} key="account" />
          ) : pane === 'careers' ? (
            <CareersPanel key="careers" />
          ) : pane === 'services' ? (
            <ServicesPanel key="services" onPick={onClose} />
          ) : (
            <VehicleList category={pane} onPick={onClose} />
          )}
        </aside>
      </div>

      <button ref={closeRef} className="menu-close" onClick={onClose} aria-label="Close menu" tabIndex={open ? 0 : -1}>
        <CloseIcon />
      </button>
    </div>
  )
}
