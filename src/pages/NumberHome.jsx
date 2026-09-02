import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loadNumberState, setDigitMode } from '../lib/numberProgress.js'
import { useLang } from '../lib/i18n.jsx'

const MODES = [
  { id: 'd1', icon: '1', labelKey: 'numbers.mode.d1.label', descKey: 'numbers.mode.d1.desc' },
  { id: 'd2', icon: '22', labelKey: 'numbers.mode.d2.label', descKey: 'numbers.mode.d2.desc' },
  { id: 'd3', icon: '333', labelKey: 'numbers.mode.d3.label', descKey: 'numbers.mode.d3.desc' },
  { id: 'd4', icon: '4444', labelKey: 'numbers.mode.d4.label', descKey: 'numbers.mode.d4.desc' },
]

export default function NumberHome() {
  const [state, setState] = useState(() => loadNumberState())
  const navigate = useNavigate()
  const { t } = useLang()

  const accuracy = state.totalGuesses > 0 ? Math.round((state.totalCorrect / state.totalGuesses) * 100) : 0

  function startMode(digitMode) {
    const next = setDigitMode(state, digitMode)
    setState(next)
    navigate('/numbers/train')
  }

  return (
    <div className="home-page">
      <Link to="/" className="back-link">{t('back.keen')}</Link>
      <h1>{t('numbers.title')}</h1>
      <p className="tagline">{t('numbers.tagline')}</p>

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

      <div className="mode-cards">
        {MODES.map((m) => (
          <button key={m.id} className="mode-card" onClick={() => startMode(m.id)}>
            <span className="mode-icon number-mode-icon">{m.icon}</span>
            <span className="mode-label">{t(m.labelKey)}</span>
            <span className="mode-desc">{t(m.descKey)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
