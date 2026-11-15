import { Link } from 'react-router-dom'

// Header shared by every mode home: back link, mode emblem, title, tagline.
export default function ModeHeader({ hue, Emblem, title, tagline }) {
  return (
    <header className={`mode-header hue-${hue}`}>
      <Link to="/" className="back-chip">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        Keen
      </Link>
      <div className="mode-header-row">
        <span className="emblem-tile emblem-lg"><Emblem /></span>
        <h1>{title}</h1>
      </div>
      <p className="tagline">{tagline}</p>
    </header>
  )
}

export function StatRow({ items }) {
  return (
    <div className="stat-row">
      {items.map((s) => (
        <div key={s.label} className="stat">
          <span className="stat-value">{s.value}</span>
          <span className="stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  )
}
