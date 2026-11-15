import { Link } from 'react-router-dom'
import { loadTimeState } from '../lib/timeProgress.js'
import { useLang } from '../lib/i18n.jsx'
import { TimeEmblem } from '../components/Emblems.jsx'
import ModeHeader from '../components/ModeHeader.jsx'
import ZoneMap from '../components/ZoneMap.jsx'
import EyesFreeNote from '../components/EyesFreeNote.jsx'
import RecordCard from '../components/RecordCard.jsx'

export default function TimeHome() {
  const { t } = useLang()
  const state = loadTimeState()
  // avg miss over the attempts that recorded it (older data has none)
  const avgErr = state.errN > 0 ? `±${(state.errSum / state.errN).toFixed(2)}s` : '—'

  return (
    <div className="home-page">
      <ModeHeader hue="time" Emblem={TimeEmblem} title={t('time.title')} tagline={t('time.tagline')} />
      <RecordCard hue="time" n={state.totalGuesses} c={state.totalCorrect} chance={null} bestStreak={state.bestStreak} sessions={state.sessions} metric={{ label: t('hud.avgOff'), value: avgErr }} note={t('record.timeNote')} />
      <Link to="/time/train" className="start-button hue-time">{t('cta.play')}</Link>
      <div className="zone-explain hue-time">
        <ZoneMap layout="single" zones={[{ id: 'go', tone: 'time', glyph: '\u25B6' }]} />
        <p>{t('zones.time')}</p>
      </div>
      <EyesFreeNote />
    </div>
  )
}
