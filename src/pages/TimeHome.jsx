import { Link } from 'react-router-dom'
import { loadTimeState } from '../lib/timeProgress.js'
import { useLang } from '../lib/i18n.jsx'
import { TimeEmblem } from '../components/Emblems.jsx'
import ModeHeader, { StatRow } from '../components/ModeHeader.jsx'
import ZoneMap from '../components/ZoneMap.jsx'
import EyesFreeNote from '../components/EyesFreeNote.jsx'

export default function TimeHome() {
  const { t } = useLang()
  const state = loadTimeState()
  const accuracy = state.totalGuesses > 0 ? Math.round((state.totalCorrect / state.totalGuesses) * 100) : 0

  return (
    <div className="home-page">
      <ModeHeader hue="time" Emblem={TimeEmblem} title={t('time.title')} tagline={t('time.tagline')} />
      <StatRow items={[{ label: t('stat.bestStreak'), value: state.bestStreak }, { label: t('stat.accuracy'), value: `${accuracy}%` }]} />
      <Link to="/time/train" className="start-button hue-time">{t('cta.play')}</Link>
      <div className="zone-explain hue-time">
        <ZoneMap layout="single" zones={[{ id: 'go', tone: 'time', glyph: '\u25B6' }]} />
        <p>{t('zones.time')}</p>
      </div>
      <EyesFreeNote />
    </div>
  )
}
