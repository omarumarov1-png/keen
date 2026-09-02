import { Link } from 'react-router-dom'
import { loadBusinessState } from '../lib/businessProgress.js'
import { useLang } from '../lib/i18n.jsx'

export default function BusinessHome() {
  const { t } = useLang()
  const state = loadBusinessState()
  const accuracy = state.totalGuesses > 0 ? Math.round((state.totalCorrect / state.totalGuesses) * 100) : 0

  return (
    <div className="home-page">
      <Link to="/" className="back-link">{t('back.keen')}</Link>
      <h1>{t('business.title')}</h1>
      <p className="tagline">{t('business.tagline')}</p>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{state.bestStreak}</span>
          <span className="stat-label">{t('stat.bestStreak')}</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{accuracy}%</span>
          <span className="stat-label">{t('stat.accuracy')}</span>
        </div>
      </div>

      <Link to="/business/train" className="start-button">{t('biztrain.prompt')}</Link>
    </div>
  )
}
