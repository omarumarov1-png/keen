import { useState } from 'react'
import { Link } from 'react-router-dom'
import { loadState, setExposureSeconds } from '../lib/progress.js'

export default function Home() {
  const [state, setState] = useState(() => loadState())

  const accuracy = state.totalAttempts > 0 ? Math.round((state.totalCorrect / state.totalAttempts) * 100) : 0

  function changeExposure(seconds) {
    setState(setExposureSeconds(state, seconds))
  }

  return (
    <div className="home-page">
      <h1>Chess Intuition Trainer</h1>
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

      <Link to="/train" className="start-button">Start Training</Link>

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
