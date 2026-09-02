import { useState } from 'react'
import { Link } from 'react-router-dom'
import { loadCardState, resetCardState } from '../lib/cardProgress.js'

export default function CardHome() {
  const [state, setState] = useState(() => loadCardState())
  const accuracy = state.totalGuesses > 0 ? Math.round((state.totalCorrect / state.totalGuesses) * 100) : 0

  return (
    <div className="home-page">
      <Link to="/" className="back-link">&larr; Intuition Trainer</Link>
      <h1>Card Intuition</h1>
      <p className="tagline">
        A card is drawn face-down. Before it flips, trust your gut: black or white?
        Real ranks and suits — spades/clubs read black, hearts/diamonds/jokers read white.
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{accuracy}%</span>
          <span className="stat-label">Accuracy</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{state.bestStreak}</span>
          <span className="stat-label">Best streak</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{state.totalGuesses}</span>
          <span className="stat-label">Total guesses</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">50%</span>
          <span className="stat-label">Chance baseline</span>
        </div>
      </div>

      <Link to="/cards/train" className="start-button">Start Guessing</Link>

      <button
        className="reset-link"
        onClick={() => setState(resetCardState())}
      >
        Reset stats
      </button>
    </div>
  )
}
