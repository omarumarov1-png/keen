import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { buildDeck, shuffle } from '../lib/cards.js'
import { loadCardState, recordGuess } from '../lib/cardProgress.js'

export default function CardTrain() {
  const [state, setState] = useState(() => loadCardState())
  const [current, setCurrent] = useState(null)
  const [phase, setPhase] = useState('guessing') // guessing | revealed
  const [lastGuess, setLastGuess] = useState(null)

  const deckRef = useRef([])
  const indexRef = useRef(0)
  const advanceRef = useRef(null)

  const drawNext = useCallback(() => {
    if (indexRef.current >= deckRef.current.length) {
      deckRef.current = shuffle(buildDeck({ includeJokers: true }))
      indexRef.current = 0
    }
    const card = deckRef.current[indexRef.current]
    indexRef.current += 1
    setCurrent(card)
    setPhase('guessing')
    setLastGuess(null)
  }, [])

  useEffect(() => {
    deckRef.current = shuffle(buildDeck({ includeJokers: true }))
    indexRef.current = 0
    drawNext()
    return () => clearTimeout(advanceRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function guess(color) {
    if (phase !== 'guessing' || !current) return
    setLastGuess(color)
    setPhase('revealed')
    const correct = color === current.color
    setState(recordGuess(state, correct))
    advanceRef.current = setTimeout(drawNext, 1400)
  }

  if (!current) return <p>Shuffling…</p>

  const accuracy = state.totalGuesses > 0 ? Math.round((state.totalCorrect / state.totalGuesses) * 100) : 0
  const edge = state.totalGuesses >= 10 ? accuracy - 50 : null

  return (
    <div className="cardtrain-page">
      <div className="train-hud">
        <Link to="/cards" className="back-link">&larr; Menu</Link>
        <div className="hud-stats">
          <span>Streak: <strong>{state.streak}</strong></span>
          <span>Accuracy: <strong>{accuracy}%</strong></span>
          {edge !== null && (
            <span className={edge > 0 ? 'edge-positive' : edge < 0 ? 'edge-negative' : ''}>
              {edge > 0 ? '+' : ''}{edge} vs chance
            </span>
          )}
        </div>
      </div>

      <p className="card-prompt">
        {phase === 'guessing' ? 'Is the next card black or white?' : lastGuess === current.color ? '✓ Correct!' : '✗ Not quite'}
      </p>

      <div className="card-stage">
        <div className={`playing-card ${phase === 'revealed' ? `revealed ${current.color}` : 'face-down'}`}>
          {phase === 'revealed' ? (
            <>
              <span className="card-corner card-corner-tl">{current.rank}<br />{current.symbol}</span>
              <span className="card-center">{current.symbol}</span>
              <span className="card-corner card-corner-br">{current.rank}<br />{current.symbol}</span>
            </>
          ) : (
            <span className="card-back-pattern">?</span>
          )}
        </div>
      </div>

      <div className="guess-buttons">
        <button
          className="guess-btn guess-black"
          onClick={() => guess('black')}
          disabled={phase !== 'guessing'}
        >
          ⚫ Black
        </button>
        <button
          className="guess-btn guess-white"
          onClick={() => guess('white')}
          disabled={phase !== 'guessing'}
        >
          ⚪ White
        </button>
      </div>
    </div>
  )
}
