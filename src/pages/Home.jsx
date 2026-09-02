import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loadState, setExposureSeconds, setColorFilter } from '../lib/progress.js'
import { useLang } from '../lib/i18n.jsx'

const MODES = [
  { id: 'w', icon: '♔', labelKey: 'chess.mode.white.label', descKey: 'chess.mode.white.desc' },
  { id: 'b', icon: '♚', labelKey: 'chess.mode.black.label', descKey: 'chess.mode.black.desc' },
  { id: 'both', icon: '♟', labelKey: 'chess.mode.mixed.label', descKey: 'chess.mode.mixed.desc' },
]

export default function Home() {
  const [state, setState] = useState(() => loadState())
  const navigate = useNavigate()
  const { t } = useLang()

  const accuracy = state.totalAttempts > 0 ? Math.round((state.totalCorrect / state.totalAttempts) * 100) : 0

  function changeExposure(seconds) {
    setState(setExposureSeconds(state, seconds))
  }

  function startMode(colorFilter) {
    const next = setColorFilter(state, colorFilter)
    setState(next)
    navigate('/chess/train')
  }

  return (
    <div className="home-page">
      <Link to="/" className="back-link">{t('back.keen')}</Link>
      <h1>{t('chess.title')}</h1>
      <p className="tagline">{t('chess.tagline')}</p>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{state.rating}</span>
          <span className="stat-label">{t('stat.rating')}</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{state.bestStreak}</span>
          <span className="stat-label">{t('stat.bestStreak')}</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{accuracy}%</span>
          <span className="stat-label">{t('stat.accuracy')}</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{state.totalAttempts}</span>
          <span className="stat-label">{t('stat.puzzlesSeen')}</span>
        </div>
      </div>

      <div className="mode-cards">
        {MODES.map((m) => (
          <button key={m.id} className="mode-card" onClick={() => startMode(m.id)}>
            <span className="mode-icon">{m.icon}</span>
            <span className="mode-label">{t(m.labelKey)}</span>
            <span className="mode-desc">{t(m.descKey)}</span>
          </button>
        ))}
      </div>

      <div className="settings">
        <label htmlFor="exposure">
          {t('chess.exposure')} <strong>{state.exposureSeconds}s</strong>
        </label>
        <input
          id="exposure"
          type="range"
          min="2"
          max="15"
          step="1"
          value={state.exposureSeconds}
          onChange={(e) => changeExposure(Number(e.target.value))}
        />
      </div>
    </div>
  )
}
