import { Link } from 'react-router-dom'
import { useLang } from '../lib/i18n.jsx'
import { useWakeLock } from '../lib/wakeLock.js'

// Full-viewport training layout used by every training screen:
//   - a deliberately small exit control tucked into the top-left corner
//     (far from the answer zones, so it is hard to hit by accident)
//   - small, low-contrast stats top-right
//   - the stage (card / board / number) in the middle
//   - optional answer zones filling the lower part of the screen
// It also holds a screen wake lock for as long as it is mounted.
export default function TrainShell({ backTo, stats = [], children, zones = null, className = '' }) {
  const { t } = useLang()
  useWakeLock()
  return (
    <div className={`train-shell${zones ? ' has-zones' : ''} ${className}`}>
      <header className="train-top">
        <Link to={backTo} className="train-exit" aria-label={t('train.exit')}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </Link>
        <div className="train-stats">
          {stats.map((s) => (
            <span key={s.key} className={`train-stat${s.tone ? ` tone-${s.tone}` : ''}`}>
              <small>{s.label}</small>
              <b>{s.value}</b>
            </span>
          ))}
        </div>
      </header>
      <main className="train-stage">{children}</main>
      {zones}
    </div>
  )
}
