import { Link } from 'react-router-dom'
import { loadCardState } from '../lib/cardProgress.js'
import { loadSuitState } from '../lib/suitProgress.js'
import { useLang } from '../lib/i18n.jsx'
import { bwZones, suitZones } from '../lib/eyesFree.jsx'
import { CardsEmblem, SuitsEmblem } from '../components/Emblems.jsx'
import ModeHeader from '../components/ModeHeader.jsx'
import ZoneMap from '../components/ZoneMap.jsx'
import EyesFreeNote from '../components/EyesFreeNote.jsx'
import RecordCard from '../components/RecordCard.jsx'
import { CHANCE } from '../lib/stats.js'

export default function CardHome() {
  const { t } = useLang()
  const bw = loadCardState()
  const suits = loadSuitState()
  const bwAccuracy = bw.totalGuesses > 0 ? Math.round((bw.totalCorrect / bw.totalGuesses) * 100) : 0
  const suitAccuracy = suits.totalGuesses > 0 ? Math.round((suits.totalCorrect / suits.totalGuesses) * 100) : 0

  return (
    <div className="home-page">
      <ModeHeader hue="cards" Emblem={CardsEmblem} title={t('cards.title')} tagline={t('cards.tagline')} />

      <div className="play-list">
        <Link to="/cards/train" className="play-card hue-cards">
          <ZoneMap layout="halves" zones={bwZones(t)} />
          <span className="play-body">
            <span className="tile-label">{t('cards.bw.label')}</span>
            <span className="tile-desc">{t('zones.bw')}</span>
            <span className="play-meta">
              {bw.totalGuesses > 0 ? t('meta.played', { accuracy: bwAccuracy, streak: bw.bestStreak }) : t('meta.new')}
            </span>
            <span className="play-cta">{t('cta.play')}</span>
          </span>
        </Link>

        <Link to="/cards/suits" className="play-card hue-cards">
          <ZoneMap layout="quad" zones={suitZones(t)} />
          <span className="play-body">
            <span className="tile-label"><span className="inline-emblem"><SuitsEmblem /></span>{t('cards.suits.label')}</span>
            <span className="tile-desc">{t('zones.suits')}</span>
            <span className="play-meta">
              {suits.totalGuesses > 0 ? t('meta.played', { accuracy: suitAccuracy, streak: suits.bestStreak }) : t('meta.new')}
            </span>
            <span className="play-cta">{t('cta.play')}</span>
          </span>
        </Link>
      </div>

      <div className="record-list">
        <RecordCard hue="cards" title={t('cards.bw.label')} n={bw.totalGuesses} c={bw.totalCorrect} chance={CHANCE.cards} bestStreak={bw.bestStreak} sessions={bw.sessions} />
        <RecordCard hue="cards" title={t('cards.suits.label')} n={suits.totalGuesses} c={suits.totalCorrect} chance={CHANCE.suits} bestStreak={suits.bestStreak} sessions={suits.sessions} />
      </div>

      <EyesFreeNote />
    </div>
  )
}
