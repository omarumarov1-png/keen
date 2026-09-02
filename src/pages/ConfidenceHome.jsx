import { Link } from 'react-router-dom'
import { loadConfidenceState } from '../lib/confidenceProgress.js'
import { useLang } from '../lib/i18n.jsx'

export default function ConfidenceHome() {
  const { t } = useLang()
  const state = loadConfidenceState()
  const accuracy = state.totalGuesses > 0 ? Math.round((state.totalCorrect / state.totalGuesses) * 100) : 0

  return (
    <div className="home-page">
      <Link to="/" className="back-link">{t('back.keen')}</Link>
      <h1>{t('confidence.title')}</h1>
      <p className="tagline">{t('confidence.tagline')}</p>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{state.score}</span>
          <span className="stat-label">{t('confidence.score')}</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{accuracy}%</span>
          <span className="stat-label">{t('stat.accuracy')}</span>
        </div>
      </div>

      <Link to="/confidence/train" className="start-button">{t('timetrain.start')}</Link>
    </div>
  )
}
