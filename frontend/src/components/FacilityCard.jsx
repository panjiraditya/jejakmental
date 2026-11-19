import { Link } from 'react-router-dom'
import { costLabel, formatShortDate, KIND_LABEL } from '../lib/format'

export function Tag({ children, tone = '' }) {
  return <span className={`tag${tone ? ` tag-${tone}` : ''}`}>{children}</span>
}

export default function FacilityCard({ facility }) {
  const isFree = facility.cost_min === 0 && facility.cost_max === 0
  return (
    <li className="result">
      <Link to={`/direktori/${facility.slug}`} className="result-link">
        <div className="result-top">
          <div>
            <h2 className="result-title">{facility.name}</h2>
            <div className="result-meta">
              {KIND_LABEL[facility.kind]}
              {facility.district ? ` · ${facility.district}` : ''}
            </div>
          </div>
          {facility.next_available && (
            <span className="result-next">
              Jadwal berikutnya {formatShortDate(facility.next_available).toLowerCase()}
            </span>
          )}
        </div>
        <p className="result-desc">{facility.summary}</p>
        <div className="result-tags">
          <Tag tone={isFree ? 'free' : facility.cost_min ? 'cost' : 'outline'}>
            {costLabel(facility)}
          </Tag>
          {facility.services.slice(0, 3).map((s) => (
            <Tag key={s}>{s}</Tag>
          ))}
          {facility.online_available && <Tag tone="online">Bisa daring</Tag>}
          {facility.emergency_24h && <Tag tone="urgent">IGD 24 jam</Tag>}
        </div>
      </Link>
    </li>
  )
}

export function FacilitySkeleton() {
  return (
    <div aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div className="skeleton-row" key={i} />
      ))}
    </div>
  )
}
