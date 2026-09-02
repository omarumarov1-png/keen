import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { buildDeck, shuffle, SUITS } from '../lib/cards.js'
import { loadSuitState, recordSuitGuess } from '../lib/suitProgress.js'
import { hapticSuccess, hapticError } from '../lib/haptics.js'
import { burstSmall, burstCelebration } from '../lib/confetti.js'
import PlayingCard from '../components/PlayingCard.jsx'

export default function SuitTrain() {
  const [state, setState] = useState(() => loadSuitState())
  const [current, setCurrent] = useState(null)
  const [phase, setPhase] = useState('guessing') // guessing | revealed
  const [lastGuess, setLastGuess] = useState(null)

  const deckRef = useRef([])
  const indexRef = useRef(0)
  const advanceRef = useRef(null)

  const drawNext = useCallback(() => {
    if (indexRef.current >= deckRef.current.length) {
      // no jokers here -- a joker has no suit among the 4 options
      deckRef.current = shuffle(buildDeck({ includeJokers: false }))
      indexRef.current = 0
    }
    const card = deckRef.current[indexRef.current]
    indexRef.current += 1
    setCurrent(card)
    setPhase('guessing')
    setLastGuess(null)
  }, [])

  useEffect(() => {
    deckRef.current = shuffle(buildDeck({ includeJokers: false }))
    indexRef.current = 0
    drawNext()
    return () => clearTimeout(advanceRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function guess(suitId) {
    if (phase !== 'guessing' || !current) return
    setLastGuess(suitId)
    setPhase('revealed')
    const correct = suitId === current.suit
    const newStreak = correct ? state.streak + 1 : 0
    if (correct) {
      hapticSuccess()
      if (newStreak >= 5 && newStreak === state.bestStreak + 1) {
        burstCelebration()
      } else {
        burstSmall()
      }
    } else {
      hapticError()
    }
    setState(recordSuitGuess(state, correct))
    advanceRef.current = setTimeout(drawNext, 1500)
  }

  if (!current) return <p>Shuffling…</p>

  const accuracy = state.totalGuesses > 0 ? Math.round((state.totalCorrect / state.totalGuesses) * 100) : 0
  const edge = state.totalGuesses >= 8 ? accuracy - 25 : null

  return (
    <div className="cardtrain-page">
      <div className="train-hud">
        <Link to="/cards" className="back-link">&larr; Menu</Link>
        <div className="hud-stats">
          <span>
            Streak: <motion.strong key={state.streak} initial={{ scale: 1.5 }} animate={{ scale: 1 }}>{state.streak}</motion.strong>
          </span>
          <span>Accuracy: <strong>{accuracy}%</strong></span>
          {edge !== null && (
            <span className={edge > 0 ? 'edge-positive' : edge < 0 ? 'edge-negative' : ''}>
              {edge > 0 ? '+' : ''}{edge} vs chance
            </span>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={phase === 'guessing' ? 'guessing' : lastGuess === current.suit ? 'correct' : 'incorrect'}
          className="card-prompt"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.18 }}
        >
          {phase === 'guessing' ? 'Which suit is next?' : lastGuess === current.suit ? '✓ Correct!' : `✗ It was ${current.suit}`}
        </motion.p>
      </AnimatePresence>

      <div className="card-stage">
        <PlayingCard revealed={phase === 'revealed'} card={current} colorMode="suit" />
      </div>

      <div className="suit-buttons">
        {SUITS.map((s) => (
          <motion.button
            key={s.id}
            className={`suit-btn suit-btn-${s.trueColor}`}
            onClick={() => guess(s.id)}
            disabled={phase !== 'guessing'}
            whileTap={{ scale: 0.92 }}
          >
            <span className="suit-symbol">{s.symbol}</span>
            <span className="suit-name">{s.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
