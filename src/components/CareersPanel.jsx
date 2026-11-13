import { PHONE } from '../data/contact.js'
import { ArrowRightIcon, PhoneIcon } from './Icons.jsx'
import './CareersPanel.css'

// Teams people can apply to. These are areas of work, not specific open vacancies.
// TODO: list real openings here when Global TVS has them.
const TEAMS = [
  { title: 'Sales', text: 'Help riders find the right TVS and guide them to delivery day.' },
  { title: 'Service', text: 'Technicians and service advisors who keep every bike running well.' },
  { title: 'Finance & Insurance', text: 'Loans, EMIs, insurance and registration, explained clearly.' },
  { title: 'Front desk & accounts', text: 'The first welcome at the showroom and the work behind it.' },
]

const message = encodeURIComponent('Hi Global TVS, I would like to apply for a job. My name is ')
const WHATSAPP = `https://wa.me/${PHONE.replace('+', '')}?text=${message}`

export default function CareersPanel() {
  return (
    <div className="careers">
      <div className="careers-card">
        <h2 className="careers-title">Work with us</h2>
        <p className="careers-text">
          We’re a team of riders, technicians and advisors across four showrooms in Bengaluru. If you love two-wheelers,
          we’d like to hear from you.
        </p>
        <a className="careers-btn" href={WHATSAPP} target="_blank" rel="noreferrer">
          Send your CV on WhatsApp <ArrowRightIcon width={18} height={18} />
        </a>
        <a className="careers-call" href={`tel:${PHONE}`}>
          <PhoneIcon width={16} height={16} /> or call +91 7619 37 5566
        </a>
      </div>

      <p className="careers-label">Teams</p>
      <ul className="careers-teams">
        {TEAMS.map((t, i) => (
          <li key={t.title} style={{ '--i': i }}>
            <span className="careers-num">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h3>{t.title}</h3>
              <p>{t.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
