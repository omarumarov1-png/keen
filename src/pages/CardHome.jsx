import { Link } from 'react-router-dom'
import { loadCardState } from '../lib/cardProgress.js'
import { loadSuitState } from '../lib/suitProgress.js'
import { useLang } from '../lib/i18n.jsx'

export default function CardHome() {
  const { t } = useLang()
  const bw = loadCardState()
  const suits = loadSuitState()
  const bwAccuracy = bw.totalGuesses > 0 ? Math.round((bw.totalCorrect / bw.totalGuesses) * 100) : 0
  const suitAccuracy = suits.totalGuesses > 0 ? Math.round((suits.totalCorrect / suits.totalGuesses) * 100) : 0

  return (
    <div className="home-page">
      <Link to="/" className="back-link">{t('back.keen')}</Link>
      <h1>{t('cards.title')}</h1>
      <p className="tagline">{t('cards.tagline')}</p>

      <div className="mode-cards">
        <Link to="/cards/train" className="mode-card">
          <span className="mode-icon">⚫⚪</span>
          <span className="mode-label">{t('cards.bw.label')}</span>
          <span className="mode-desc">
            {bw.totalGuesses > 0
              ? t('cards.bw.descPlayed', { accuracy: bwAccuracy, streak: bw.bestStreak })
              : t('cards.bw.descUnplayed')}
          </span>
        </Link>
        <Link to="/cards/suits" className="mode-card">
          <span className="mode-icon">
            <span className="suit-black">♠♣</span>
            <span className="suit-red">♥♦</span>
          </span>
          <span className="mode-label">{t('cards.suits.label')}</span>
          <span className="mode-desc">
            {suits.totalGuesses > 0
              ? t('cards.suits.descPlayed', { accuracy: suitAccuracy, streak: suits.bestStreak })
              : t('cards.suits.descUnplayed')}
          </span>
        </Link>
      </div>
    </div>
  )
}
