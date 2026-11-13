import { Link } from 'react-router-dom'
import models from '../data/models.js'
import { ArrowRightIcon } from './Icons.jsx'
import './VehicleList.css'

const LABELS = { motorcycles: 'motorcycles', scooters: 'scooters', electric: 'electric models' }

export default function VehicleList({ category, onPick }) {
  const list = models.filter((m) => m.category === category)

  return (
    <>
      <Link className="vehicle-all" to={`/models/${category}`} onClick={onPick}>
        View all {LABELS[category]} <ArrowRightIcon width={18} height={18} />
      </Link>
      {/* key forces the stagger animation to replay when the category changes */}
      <ul className="vehicle-list" key={category}>
        {list.map((m, i) => (
          <li key={m.slug} style={{ '--i': i }}>
            <Link className="vehicle-card" to={`/model/${m.slug}`} onClick={onPick}>
              <span className="vehicle-name">{m.name}</span>
              <span className="vehicle-img">
                <img src={m.image} alt="" loading={i < 3 ? 'eager' : 'lazy'} decoding="async" />
              </span>
              <span className="vehicle-tag">{m.fuel}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
