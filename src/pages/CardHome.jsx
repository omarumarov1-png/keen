import { Link } from 'react-router-dom'
import { loadCardState } from '../lib/cardProgress.js'
import { loadSuitState } from '../lib/suitProgress.js'

export default function CardHome() {
  const bw = loadCardState()
  const suits = loadSuitState()
  const bwAccuracy = bw.totalGuesses > 0 ? Math.round((bw.totalCorrect / bw.totalGuesses) * 100) : 0
  const suitAccuracy = suits.totalGuesses > 0 ? Math.round((suits.totalCorrect / suits.totalGuesses) * 100) : 0

  return (
    <div className="home-page">
      <Link to="/" className="back-link">&larr; Intuition Trainer</Link>
      <h1>Card Intuition</h1>
      <p className="tagline">
        A card is drawn face-down. Before it flips, trust your gut.
      </p>

      <div className="mode-cards">
        <Link to="/cards/train" className="mode-card">
          <span className="mode-icon">⚫⚪</span>
          <span className="mode-label">Black or White</span>
          <span className="mode-desc">
            Binary call. {bw.totalGuesses > 0 ? `${bwAccuracy}% accuracy, best streak ${bw.bestStreak}` : 'Not played yet'}
          </span>
        </Link>
        <Link to="/cards/suits" className="mode-card">
          <span className="mode-icon">♠♥♣♦</span>
          <span className="mode-label">Guess the Suit</span>
          <span className="mode-desc">
            4-way call — spades, hearts, clubs, diamonds. {suits.totalGuesses > 0 ? `${suitAccuracy}% accuracy, best streak ${suits.bestStreak}` : 'Not played yet'}
          </span>
        </Link>
      </div>
    </div>
  )
}
