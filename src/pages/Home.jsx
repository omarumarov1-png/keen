import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loadState, setExposureSeconds, setColorFilter } from '../lib/progress.js'

const MODES = [
  { id: 'w', label: 'Train as White', icon: '♔', desc: 'Only puzzles where White finds the move' },
  { id: 'b', label: 'Train as Black', icon: '♚', desc: 'Only puzzles where Black finds the move' },
  { id: 'both', label: 'Mixed', icon: '♟', desc: 'Both colors, shuffled' },
]

export default function Home() {
  const [state, setState] = useState(() => loadState())
  const navigate = useNavigate()

  const accuracy = state.totalAttempts > 0 ? Math.round((state.totalCorrect / state.totalAttempts) * 100) : 0

  function changeExposure(seconds) {
    setState(setExposureSeconds(state, seconds))
  }

  function startMode(colorFilter) {
    const next = setColorFilter(state, colorFilter)
    setState(next)
    navigate('/chess/train')
  }

  return (
    <div className="home-page">
      <Link to="/" className="back-link">&larr; Keen</Link>
      <h1>Chess Intuition</h1>
      <p className="tagline">
        Flash positions. Trust your first instinct. No calculation, no takebacks —
        just pattern recognition, sharpened.
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{state.rating}</span>
          <span className="stat-label">Rating</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{state.bestStreak}</span>
          <span className="stat-label">Best streak</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{accuracy}%</span>
          <span className="stat-label">Accuracy</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{state.totalAttempts}</span>
          <span className="stat-label">Puzzles seen</span>
        </div>
      </div>

      <div className="mode-cards">
        {MODES.map((m) => (
          <button key={m.id} className="mode-card" onClick={() => startMode(m.id)}>
            <span className="mode-icon">{m.icon}</span>
            <span className="mode-label">{m.label}</span>
            <span className="mode-desc">{m.desc}</span>
          </button>
        ))}
      </div>

      <div className="settings">
        <label htmlFor="exposure">
          Exposure time: <strong>{state.exposureSeconds}s</strong>
        </label>
        <input
          id="exposure"
          type="range"
          min="2"
          max="15"
          step="1"
          value={state.exposureSeconds}
          onChange={(e) => changeExposure(Number(e.target.value))}
        />
      </div>
    </div>
  )
}
