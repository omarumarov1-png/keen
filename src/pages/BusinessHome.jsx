import { Link } from 'react-router-dom'
import { loadBusinessState } from '../lib/businessProgress.js'
import { useLang } from '../lib/i18n.jsx'
import { BusinessEmblem } from '../components/Emblems.jsx'
import RecordCard from '../components/RecordCard.jsx'
import { CHANCE } from '../lib/stats.js'
import ModeHeader from '../components/ModeHeader.jsx'

export default function BusinessHome() {
  const { t } = useLang()
  const state = loadBusinessState()

  return (
    <div className="home-page">
      <ModeHeader hue="business" Emblem={BusinessEmblem} title={t('business.title')} tagline={t('business.tagline')} />
      <RecordCard hue="business" n={state.totalGuesses} c={state.totalCorrect} chance={CHANCE.business} bestStreak={state.bestStreak} sessions={state.sessions} />
      <Link to="/business/train" className="start-button hue-business">{t('cta.play')}</Link>
    </div>
  )
}
