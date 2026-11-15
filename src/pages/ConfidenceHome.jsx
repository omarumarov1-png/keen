import { Link } from 'react-router-dom'
import { loadConfidenceState } from '../lib/confidenceProgress.js'
import { useLang } from '../lib/i18n.jsx'
import { ConfidenceEmblem } from '../components/Emblems.jsx'
import ModeHeader from '../components/ModeHeader.jsx'
import ZoneMap from '../components/ZoneMap.jsx'
import EyesFreeNote from '../components/EyesFreeNote.jsx'
import RecordCard from '../components/RecordCard.jsx'
import { CHANCE } from '../lib/stats.js'
import { bwZones, stakeZones } from '../lib/eyesFree.jsx'

export default function ConfidenceHome() {
  const { t } = useLang()
  const state = loadConfidenceState()

  return (
    <div className="home-page">
      <ModeHeader hue="confidence" Emblem={ConfidenceEmblem} title={t('confidence.title')} tagline={t('confidence.tagline')} />
      <RecordCard hue="confidence" n={state.totalGuesses} c={state.totalCorrect} chance={CHANCE.confidence} bestStreak={state.bestStreak} sessions={state.sessions} extras={[{ k: 'score', label: t('confidence.score'), value: state.score }]} />
      <Link to="/confidence/train" className="start-button hue-confidence">{t('cta.play')}</Link>
      <div className="zone-explain hue-confidence">
        <div className="zone-pair">
          <ZoneMap layout="thirds" zones={stakeZones(t).map((z) => ({ ...z, glyph: `×${z.id}` }))} caption="1" />
          <span className="zone-pair-arrow" aria-hidden="true">→</span>
          <ZoneMap layout="halves" zones={bwZones(t)} caption="2" />
        </div>
        <p>{t('zones.confidence')}</p>
      </div>
      <EyesFreeNote />
    </div>
  )
}
