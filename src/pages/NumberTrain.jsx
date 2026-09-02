import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { generateRound } from '../lib/numbers.js'
import { loadNumberState, recordNumberGuess } from '../lib/numberProgress.js'
import { hapticSuccess, hapticError } from '../lib/haptics.js'
import { burstSmall, burstCelebration } from '../lib/confetti.js'
import { useLang } from '../lib/i18n.jsx'
import { maybePickQuote } from '../lib/quotes.js'
import QuoteBanner from '../components/QuoteBanner.jsx'

export default function NumberTrain() {
  const { t } = useLang()
  const [state, setState] = useState(() => loadNumberState())
  const [round, setRound] = useState(null)
  const [phase, setPhase] = useState('guessing') // guessing | revealed
  const [lastGuess, setLastGuess] = useState(null)
  const [quote, setQuote] = useState(null)

  const advanceRef = useRef(null)

  const drawNext = useCallback((digitMode) => {
    setRound(generateRound(digitMode))
    setPhase('guessing')
    setLastGuess(null)
    setQuote(null)
  }, [])

  useEffect(() => {
    drawNext(state.digitMode)
    return () => clearTimeout(advanceRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function guess(value) {
    if (phase !== 'guessing' || !round) return
    setLastGuess(value)
    setPhase('revealed')
    const pickedQuote = maybePickQuote()
    setQuote(pickedQuote)
    const correct = value === round.target
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
    const next = recordNumberGuess(state, correct)
    setState(next)
    if (!pickedQuote) {
      advanceRef.current = setTimeout(() => drawNext(next.digitMode), 1400)
    }
  }

  if (!round) return <p>{t('cardtrain.shuffling')}</p>

  const accuracy = state.totalGuesses > 0 ? Math.round((state.totalCorrect / state.totalGuesses) * 100) : 0
  const chanceBaseline = 25
  const edge = state.totalGuesses >= 8 ? accuracy - chanceBaseline : null

  return (
    <div className="cardtrain-page">
      <div className="train-hud">
        <Link to="/numbers" className="back-link">{t('back.menu')}</Link>
        <div className="hud-stats">
          <span>
            {t('train.streak')} <motion.strong key={state.streak} initial={{ scale: 1.5 }} animate={{ scale: 1 }}>{state.streak}</motion.strong>
          </span>
          <span>{t('train.accuracy')} <strong>{accuracy}%</strong></span>
          {edge !== null && (
            <span className={edge > 0 ? 'edge-positive' : edge < 0 ? 'edge-negative' : ''}>
              {edge > 0 ? '+' : ''}{edge} {t('cardtrain.vsChance')}
            </span>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={phase === 'guessing' ? 'guessing' : lastGuess === round.target ? 'correct' : 'incorrect'}
          className="card-prompt"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.18 }}
        >
          {phase === 'guessing'
            ? t('numtrain.prompt')
            : lastGuess === round.target
              ? t('numtrain.correct')
              : `${t('numtrain.incorrectPrefix')} ${round.target}`}
        </motion.p>
      </AnimatePresence>

      <div className="card-stage">
        <div className={`flip-scene`}>
          <motion.div
            className="flip-inner"
            animate={{ rotateY: phase === 'revealed' ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            <div className="flip-face flip-face-back">
              <div className="card-back-pattern">
                <span className="card-back-mark">?</span>
              </div>
            </div>
            <div className="flip-face flip-face-front playing-card-face number-reveal-face">
              {phase === 'revealed' && (
                <motion.span
                  className="number-reveal-value"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.28, type: 'spring', stiffness: 300, damping: 18 }}
                >
                  {round.target}
                </motion.span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="number-buttons">
        {round.options.map((opt) => (
          <motion.button
            key={opt}
            className="number-btn"
            onClick={() => guess(opt)}
            disabled={phase !== 'guessing'}
            whileTap={{ scale: 0.92 }}
          >
            {opt}
          </motion.button>
        ))}
      </div>

      <QuoteBanner quote={quote} />
      {quote && phase === 'revealed' && (
        <button className="tap-continue-btn" onClick={() => drawNext(state.digitMode)}>{t('tap.continue')}</button>
      )}
    </div>
  )
}
