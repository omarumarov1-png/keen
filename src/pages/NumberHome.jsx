import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadNumberState, setDigitMode } from '../lib/numberProgress.js'
import { useLang } from '../lib/i18n.jsx'
import { NumbersEmblem } from '../components/Emblems.jsx'
import ModeHeader from '../components/ModeHeader.jsx'
import ZoneMap from '../components/ZoneMap.jsx'
import EyesFreeNote from '../components/EyesFreeNote.jsx'
import RecordCard from '../components/RecordCard.jsx'
import { CHANCE } from '../lib/stats.js'

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

  function startMode(digitMode) {
    const next = setDigitMode(state, digitMode)
    setState(next)
    navigate('/numbers/train')
  }

  return (
    <div className="home-page">
      <ModeHeader hue="numbers" Emblem={NumbersEmblem} title={t('numbers.title')} tagline={t('numbers.tagline')} />

      <RecordCard hue="numbers" n={state.totalGuesses} c={state.totalCorrect} chance={CHANCE.numbers} bestStreak={state.bestStreak} sessions={state.sessions} />

      <div className="digit-grid hue-numbers">
        {MODES.map((m) => (
          <button key={m.id} className="digit-tile" onClick={() => startMode(m.id)}>
            <span className="digit-icon">{m.icon}</span>
            <span className="tile-label">{t(m.labelKey)}</span>
            <span className="tile-desc">{t(m.descKey)}</span>
          </button>
        ))}
      </div>

      <div className="zone-explain hue-numbers">
        <ZoneMap layout="quad" zones={['a', 'b', 'c', 'd'].map((id) => ({ id, tone: 'number', glyph: '#' }))} />
        <p>{t('zones.numbers')}</p>
      </div>
      <EyesFreeNote />
    </div>
  )
}
