import { Link } from 'react-router-dom'
import { loadBusinessState } from '../lib/businessProgress.js'
import { useLang } from '../lib/i18n.jsx'
import { BusinessEmblem } from '../components/Emblems.jsx'
import ModeHeader, { StatRow } from '../components/ModeHeader.jsx'

export default function BusinessHome() {
  const { t } = useLang()
  const state = loadBusinessState()
  const accuracy = state.totalGuesses > 0 ? Math.round((state.totalCorrect / state.totalGuesses) * 100) : 0

  return (
    <div className="home-page">
      <ModeHeader hue="business" Emblem={BusinessEmblem} title={t('business.title')} tagline={t('business.tagline')} />
      <StatRow items={[{ label: t('stat.bestStreak'), value: state.bestStreak }, { label: t('stat.accuracy'), value: `${accuracy}%` }]} />
      <Link to="/business/train" className="start-button hue-business">{t('cta.play')}</Link>
    </div>
  )
}
