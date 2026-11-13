import { Link } from 'react-router-dom'
import { services } from '../data/services.js'
import { ArrowRightIcon } from './Icons.jsx'
import './ServicesPanel.css'

// Menu side panel: plain list like the reference; each item opens its section on /services.
export default function ServicesPanel({ onPick }) {
  return (
    <div className="svc-panel">
      <Link className="vehicle-all" to="/services" onClick={onPick}>
        All services <ArrowRightIcon width={18} height={18} />
      </Link>
      <ul>
        {services.map((s, i) => (
          <li key={s.id} style={{ '--i': i }}>
            <Link to={`/services#${s.id}`} onClick={onPick}>
              {s.title}
            </Link>
          </li>
        ))}
        <li style={{ '--i': services.length }}>
          <Link to="/services#book" onClick={onPick}>
            Book a Service
          </Link>
        </li>
      </ul>
    </div>
  )
}
