import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { useLang } from '../lib/i18n.jsx'
import SuitIcon from '../components/SuitIcon.jsx'
import {
  BrandMark, ChessEmblem, NumbersEmblem, BusinessEmblem, TimeEmblem, ConfidenceEmblem,
} from '../components/Emblems.jsx'

const OTHERS = [
  { to: '/confidence', hue: 'confidence', Emblem: ConfidenceEmblem, key: 'confidence', eyesFree: true },
  { to: '/numbers', hue: 'numbers', Emblem: NumbersEmblem, key: 'numbers', eyesFree: true },
  { to: '/time', hue: 'time', Emblem: TimeEmblem, key: 'time', eyesFree: true },
  { to: '/chess', hue: 'chess', Emblem: ChessEmblem, key: 'chess' },
  { to: '/business', hue: 'business', Emblem: BusinessEmblem, key: 'business' },
]

export default function Landing() {
  const { t } = useLang()
  const reduce = useReducedMotion()
  const rise = (i) => (reduce ? {} : {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.05 + i * 0.045, duration: 0.4, ease: [0.2, 0.7, 0.2, 1] },
  })

  return (
    <div className="landing-page">
      <header className="brand-row">
        <BrandMark />
        <span className="wordmark">Keen</span>
      </header>

      <motion.h1 className="hero-title" {...rise(0)}>{t('landing.hero')}</motion.h1>
      <motion.p className="tagline" {...rise(1)}>{t('landing.tagline')}</motion.p>

      <motion.div {...rise(2)}>
        <Link to="/cards" className="feature-tile hue-cards">
          <span className="feature-art" aria-hidden="true">
            <span className="feature-card feature-card-back" />
            <span className="feature-card feature-card-front is-red"><SuitIcon suit="hearts" /></span>
          </span>
          <span className="feature-body">
            <span className="badge">{t('badge.eyesFree')}</span>
            <span className="tile-label">{t('landing.cards.label')}</span>
            <span className="tile-desc">{t('landing.cards.desc')}</span>
          </span>
          <span className="tile-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
          </span>
        </Link>
      </motion.div>

      <div className="tile-grid">
        {OTHERS.map((m, i) => (
          <motion.div key={m.to} {...rise(3 + i)}>
            <Link to={m.to} className={`mode-tile hue-${m.hue}`}>
              <span className="emblem-tile"><m.Emblem /></span>
              <span className="tile-label">{t(`landing.${m.key}.label`)}</span>
              <span className="tile-desc">{t(`landing.${m.key}.short`)}</span>
              {m.eyesFree && <span className="badge badge-dot" title={t('badge.eyesFree')} />}
            </Link>
          </motion.div>
        ))}
      </div>

      <p className="landing-foot">
        <span className="badge badge-dot" /> {t('landing.foot')}
      </p>
    </div>
  )
}
