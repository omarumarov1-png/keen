import { Link } from 'react-router-dom'
import { loadConfidenceState } from '../lib/confidenceProgress.js'
import { useLang } from '../lib/i18n.jsx'
import { ConfidenceEmblem } from '../components/Emblems.jsx'
import ModeHeader, { StatRow } from '../components/ModeHeader.jsx'
import ZoneMap from '../components/ZoneMap.jsx'
import EyesFreeNote from '../components/EyesFreeNote.jsx'
import { bwZones, stakeZones } from '../lib/eyesFree.jsx'

export default function ConfidenceHome() {
  const { t } = useLang()
  const state = loadConfidenceState()
  const accuracy = state.totalGuesses > 0 ? Math.round((state.totalCorrect / state.totalGuesses) * 100) : 0

  return (
    <div className="home-page">
      <ModeHeader hue="confidence" Emblem={ConfidenceEmblem} title={t('confidence.title')} tagline={t('confidence.tagline')} />
      <StatRow items={[{ label: t('confidence.score'), value: state.score }, { label: t('stat.accuracy'), value: `${accuracy}%` }]} />
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
