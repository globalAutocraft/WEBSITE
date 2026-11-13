import { useEffect, useRef, useState } from 'react'
import { AUTH_IS_DEMO, useAuth } from '../context/AuthContext.jsx'
import { PHONE, wa } from '../data/contact.js'
import { ArrowRightIcon, CloseIcon, HistoryIcon, LifebuoyIcon, SteeringIcon, WrenchIcon } from './Icons.jsx'
import './AccountPanel.css'

const quickServices = [
  { label: 'Book a Service', href: wa('Hi Global TVS, I would like to book a service for my vehicle.'), Icon: WrenchIcon },
  { label: 'Service History', href: wa('Hi Global TVS, can you share the service history of my vehicle?'), Icon: HistoryIcon },
  { label: 'Book a Test Ride', href: wa('Hi Global TVS, I would like to book a test ride.'), Icon: SteeringIcon },
  { label: 'Roadside Assistance', href: `tel:${PHONE}`, Icon: LifebuoyIcon },
]

const formatPhone = (d) => `+91 ${d.slice(0, 5)} ${d.slice(5)}`

export default function AccountPanel({ autoFocus }) {
  const { user } = useAuth()
  const [started, setStarted] = useState(false)
  const loginRef = useRef(null)

  useEffect(() => {
    if (autoFocus && !user && !started) loginRef.current?.focus({ preventScroll: true })
  }, [autoFocus, user, started])

  return (
    <div className="account">
      <div className="account-card">
        {user ? (
          <SignedIn />
        ) : started ? (
          <SignIn onCancel={() => setStarted(false)} />
        ) : (
          <>
            <h2 className="account-title">Welcome</h2>
            <p className="account-text">Sign in with your Global TVS account.</p>
            <button ref={loginRef} className="dark-btn" onClick={() => setStarted(true)}>
              Log in
            </button>
          </>
        )}
      </div>

      <p className="account-label">Services</p>
      <ul className="quick-list">
        {quickServices.map(({ label, href, Icon }) => (
          <li key={label}>
            <a href={href} {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}>
              <span className="quick-icon">
                <Icon />
              </span>
              {label}
              <ArrowRightIcon className="quick-arrow" width={18} height={18} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------- Signed out: mobile number → OTP ---------- */

function SignIn({ onCancel }) {
  const { requestOtp, verifyOtp } = useAuth()
  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState(Array(6).fill(''))
  const [busy, setBusy] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const phoneRef = useRef(null)
  const boxRefs = useRef([])

  const phoneValid = /^[6-9]\d{9}$/.test(phone)
  const codeValid = code.every((c) => c !== '')

  useEffect(() => {
    if (step === 'phone') phoneRef.current?.focus({ preventScroll: true })
  }, [step])

  useEffect(() => {
    if (seconds <= 0) return
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  const sendCode = async (e) => {
    e?.preventDefault()
    if (!phoneValid || busy) return
    setBusy(true)
    await requestOtp(phone)
    setBusy(false)
    setCode(Array(6).fill(''))
    setStep('otp')
    setSeconds(30)
    setTimeout(() => boxRefs.current[0]?.focus(), 350)
  }

  const verify = async (e) => {
    e.preventDefault()
    if (!codeValid || busy) return
    setBusy(true)
    await verifyOtp(phone, code.join(''))
  }

  const setDigit = (i, value) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length > 1) {
      // pasted a whole code
      const next = [...code]
      digits.slice(0, 6 - i).split('').forEach((d, k) => (next[i + k] = d))
      setCode(next)
      boxRefs.current[Math.min(i + digits.length, 5)]?.focus()
      return
    }
    const next = [...code]
    next[i] = digits
    setCode(next)
    if (digits && i < 5) boxRefs.current[i + 1]?.focus()
  }

  const onBoxKey = (i, e) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) boxRefs.current[i - 1]?.focus()
    if (e.key === 'ArrowLeft' && i > 0) boxRefs.current[i - 1]?.focus()
    if (e.key === 'ArrowRight' && i < 5) boxRefs.current[i + 1]?.focus()
  }

  return (
    <>
    <div className="steps-viewport">
    <div className={`steps is-${step}`}>
      <form className="step" onSubmit={sendCode} inert={step !== 'phone'}>
        <h2 className="account-title">Log in</h2>
        <p className="account-text">
          Enter your mobile number.{' '}
          <button type="button" className="text-btn" onClick={onCancel}>
            Back
          </button>
        </p>
        <label className="phone-field">
          <span className="phone-prefix">+91</span>
          <input
            ref={phoneRef}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="Mobile number"
            aria-label="Mobile number"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
          />
        </label>
        <button className="dark-btn" disabled={!phoneValid || busy}>
          {busy ? <span className="spinner" /> : 'Get OTP'}
        </button>
      </form>

      <form className="step" onSubmit={verify} inert={step !== 'otp'}>
        <h2 className="account-title">Enter the code</h2>
        <p className="account-text">
          Sent to {formatPhone(phone)}.{' '}
          <button type="button" className="text-btn" onClick={() => setStep('phone')}>
            Change
          </button>
        </p>
        <div className="otp" role="group" aria-label="6-digit code">
          {code.map((c, i) => (
            <input
              key={i}
              ref={(el) => (boxRefs.current[i] = el)}
              className={c ? 'is-filled' : ''}
              inputMode="numeric"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              aria-label={`Digit ${i + 1}`}
              value={c}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onBoxKey(i, e)}
              onFocus={(e) => e.target.select()}
            />
          ))}
        </div>
        <button className="dark-btn" disabled={!codeValid || busy}>
          {busy ? <span className="spinner" /> : 'Verify & sign in'}
        </button>
        <p className="resend">
          {seconds > 0 ? (
            <>Resend code in 0:{String(seconds).padStart(2, '0')}</>
          ) : (
            <button type="button" className="text-btn" onClick={sendCode}>
              Resend code
            </button>
          )}
        </p>
      </form>
    </div>
    </div>
    {AUTH_IS_DEMO && <p className="demo-note">Demo sign-in: no SMS is sent yet. Any 6 digits will work.</p>}
    </>
  )
}

/* ---------- Signed in: My Garage ---------- */

const PLATE = /^[A-Z]{2}\s?\d{1,2}\s?[A-Z]{0,3}\s?\d{4}$/

function formatPlate(raw) {
  const s = raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const m = s.match(/^([A-Z]{0,2})(\d{0,2})([A-Z]{0,3})(\d{0,4})/)
  if (!m) return s
  return [m[1], m[2], m[3], m[4]].filter(Boolean).join(' ')
}

function SignedIn() {
  const { user, addVehicle, removeVehicle, signOut } = useAuth()
  const [plate, setPlate] = useState('')
  const valid = PLATE.test(plate) && !user.vehicles.includes(plate)

  const add = (e) => {
    e.preventDefault()
    if (!valid) return
    addVehicle(plate)
    setPlate('')
  }

  return (
    <div className="signed-in">
      <h2 className="account-title">Hello, rider</h2>
      <p className="account-text">
        Signed in as {formatPhone(user.phone)}.{' '}
        <button type="button" className="text-btn" onClick={signOut}>
          Sign out
        </button>
      </p>

      <p className="account-label in-card">My Garage</p>
      {user.vehicles.length > 0 && (
        <ul className="garage">
          {user.vehicles.map((v) => (
            <li key={v} className="plate is-small">
              <span className="plate-ind">IND</span>
              <span className="plate-text">{v}</span>
              <button className="plate-remove" onClick={() => removeVehicle(v)} aria-label={`Remove ${v}`}>
                <CloseIcon width={14} height={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form className="garage-add" onSubmit={add}>
        <label className="plate">
          <span className="plate-ind">IND</span>
          <input
            className="plate-text"
            placeholder="KA 00 XX 0000"
            aria-label="Vehicle registration number"
            value={plate}
            maxLength={13}
            onChange={(e) => setPlate(formatPlate(e.target.value))}
          />
        </label>
        <button className="dark-btn" disabled={!valid}>
          Add vehicle
        </button>
      </form>
      {user.vehicles.length === 0 && (
        <p className="account-hint">Add your TVS to get service reminders and offers made for it.</p>
      )}
    </div>
  )
}
