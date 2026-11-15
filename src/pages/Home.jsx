import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadState, setExposureSeconds, setColorFilter } from '../lib/progress.js'
import { useLang } from '../lib/i18n.jsx'
import { ChessEmblem } from '../components/Emblems.jsx'
import ModeHeader from '../components/ModeHeader.jsx'
import RecordCard from '../components/RecordCard.jsx'
import { CHESS_FALLBACK_CHANCE } from '../lib/stats.js'

const MODES = [
  { id: 'w', icon: 'w', labelKey: 'chess.mode.white.label', descKey: 'chess.mode.white.desc' },
  { id: 'b', icon: 'b', labelKey: 'chess.mode.black.label', descKey: 'chess.mode.black.desc' },
  { id: 'both', icon: 'both', labelKey: 'chess.mode.mixed.label', descKey: 'chess.mode.mixed.desc' },
]

export default function Home() {
  const [state, setState] = useState(() => loadState())
  const navigate = useNavigate()
  const { t } = useLang()

  const chance = state.chanceN > 0 ? state.chanceSum / state.chanceN : CHESS_FALLBACK_CHANCE

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
      <ModeHeader hue="chess" Emblem={ChessEmblem} title={t('chess.title')} tagline={t('chess.tagline')} />

      <RecordCard
        hue="chess"
        n={state.totalAttempts}
        c={state.totalCorrect}
        chance={chance}
        bestStreak={state.bestStreak}
        sessions={state.sessions}
        extras={[{ k: 'rating', label: t('stat.rating'), value: state.rating }]}
        note={t('record.chessNote', { n: Math.round(1 / chance) })}
      />

      <div className="choice-list hue-chess">
        {MODES.map((m) => (
          <button key={m.id} className="choice-tile" onClick={() => startMode(m.id)}>
            <span className={`side-swatch side-${m.icon}`} aria-hidden="true" />
            <span className="choice-body">
              <span className="tile-label">{t(m.labelKey)}</span>
              <span className="tile-desc">{t(m.descKey)}</span>
            </span>
            <span className="tile-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg></span>
          </button>
        ))}
      </div>

      <div className="settings-card">
        <label htmlFor="exposure">
          <span>{t('chess.exposure')}</span> <strong>{state.exposureSeconds}s</strong>
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
