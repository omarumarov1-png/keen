import { Link } from 'react-router-dom'
import { useLang } from '../lib/i18n.jsx'

// The "how eyes-free play works" legend shown on mode homes: tap anywhere in
// a zone, automatic rhythm, the two haptic feels, screen stays awake.
export default function EyesFreeNote() {
  const { t } = useLang()
  return (
    <section className="eyes-free-note">
      <h2>{t('ef.title')}</h2>
      <ul>
        <li>
          <span className="ef-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-.6a6 6 0 0 1-4.6-2.2L4.5 15a1.6 1.6 0 0 1 2.4-2.1L9 15" /></svg>
          </span>
          {t('ef.zones')}
        </li>
        <li>
          <span className="ef-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4" /></svg>
          </span>
          {t('ef.rhythm')}
        </li>
        <li>
          <span className="ef-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><rect x="7" y="3" width="10" height="18" rx="2.5" /><path d="M3 9v6M21 9v6" /></svg>
          </span>
          <span>
            <span className="haptic-legend">
              <span className="hl hl-right"><i /><i /></span>{t('ef.hapticRight')}
            </span>
            <span className="haptic-legend">
              <span className="hl hl-wrong"><i /><i /></span>{t('ef.hapticWrong')}
            </span>
          </span>
        </li>
        <li>
          <span className="ef-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
          </span>
          {t('ef.awake')}
        </li>
      </ul>
      <Link to="/haptics" className="ef-test-link">
        <span>{t('ef.testLink')}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
      </Link>
    </section>
  )
}
