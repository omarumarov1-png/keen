import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLang } from '../lib/i18n.jsx'

const CATEGORIES = [
  { to: '/chess', icon: '♟', labelKey: 'landing.chess.label', descKey: 'landing.chess.desc' },
  { to: '/cards', icon: '🂠', labelKey: 'landing.cards.label', descKey: 'landing.cards.desc' },
  { to: '/numbers', icon: '#', labelKey: 'landing.numbers.label', descKey: 'landing.numbers.desc' },
  { to: '/business', icon: '💡', labelKey: 'landing.business.label', descKey: 'landing.business.desc' },
  { to: '/time', icon: '⏱', labelKey: 'landing.time.label', descKey: 'landing.time.desc' },
  { to: '/confidence', icon: '🎯', labelKey: 'landing.confidence.label', descKey: 'landing.confidence.desc' },
]

export default function Landing() {
  const { t } = useLang()
  return (
    <div className="landing-page">
      <motion.img
        src={`${import.meta.env.BASE_URL}logo.svg`}
        alt=""
        className="landing-logo"
        initial={{ scale: 0.7, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 16 }}
      />
      <h1>Keen</h1>
      <p className="tagline">{t('landing.tagline')}</p>
      <div className="mode-cards">
        {CATEGORIES.map((c) => (
          <Link key={c.to} to={c.to} className="mode-card">
            <span className="mode-icon">{c.icon}</span>
            <span className="mode-label">{t(c.labelKey)}</span>
            <span className="mode-desc">{t(c.descKey)}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
