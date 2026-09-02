import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { pickRandom, RECENT_WINDOW } from '../lib/businessScenarios.js'
import { loadBusinessState, recordBusinessGuess } from '../lib/businessProgress.js'
import { hapticSuccess, hapticError } from '../lib/haptics.js'
import { burstSmall, burstCelebration } from '../lib/confetti.js'
import { useLang } from '../lib/i18n.jsx'
import { maybePickQuote } from '../lib/quotes.js'
import QuoteBanner from '../components/QuoteBanner.jsx'

export default function BusinessTrain() {
  const { t } = useLang()
  const [state, setState] = useState(() => loadBusinessState())
  const [current, setCurrent] = useState(null)
  const [phase, setPhase] = useState('guessing') // guessing | revealed
  const [lastGuess, setLastGuess] = useState(null)
  const [quote, setQuote] = useState(null)

  const recentIds = useRef([])

  const drawNext = useCallback(() => {
    const scenario = pickRandom(recentIds.current)
    recentIds.current = [scenario.id, ...recentIds.current].slice(0, RECENT_WINDOW)
    setCurrent(scenario)
    setPhase('guessing')
    setLastGuess(null)
    setQuote(null)
  }, [])

  useEffect(() => {
    drawNext()
  }, [drawNext])

  function guess(value) {
    if (phase !== 'guessing' || !current) return
    setLastGuess(value)
    setPhase('revealed')
    setQuote(maybePickQuote())
    const correct = value === current.result
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
    setState(recordBusinessGuess(state, correct))
    // No auto-advance -- these take real time to read, the player taps when ready.
  }

  if (!current) return <p>…</p>

  const accuracy = state.totalGuesses > 0 ? Math.round((state.totalCorrect / state.totalGuesses) * 100) : 0
  const correct = lastGuess === current.result

  return (
    <div className="cardtrain-page business-train">
      <div className="train-hud">
        <Link to="/business" className="back-link">{t('back.menu')}</Link>
        <div className="hud-stats">
          <span>
            {t('train.streak')} <motion.strong key={state.streak} initial={{ scale: 1.5 }} animate={{ scale: 1 }}>{state.streak}</motion.strong>
          </span>
          <span>{t('train.accuracy')} <strong>{accuracy}%</strong></span>
        </div>
      </div>

      {phase === 'guessing' ? (
        <div className="business-guess-stage">
          <p className="card-prompt">{t('biztrain.prompt')}</p>
          <div className="guess-buttons">
            <motion.button className="guess-btn business-yes" onClick={() => guess('yes')} whileTap={{ scale: 0.94 }}>
              {t('biztrain.guessYes')}
            </motion.button>
            <motion.button className="guess-btn business-no" onClick={() => guess('no')} whileTap={{ scale: 0.94 }}>
              {t('biztrain.guessNo')}
            </motion.button>
          </div>
        </div>
      ) : (
        <motion.button
          className="business-reveal"
          onClick={drawNext}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <p className={`feedback ${correct ? 'correct' : 'incorrect'}`}>
            {correct ? t('biztrain.correct') : t('biztrain.incorrect')}
          </p>
          <p className={`business-situation ${!correct ? 'wrong-highlight' : ''}`}>{current.situation}</p>
          <p className="business-outcome-label">{t('biztrain.outcome')}</p>
          <p className={`business-outcome ${!correct ? 'wrong-highlight' : ''}`}>{current.outcome}</p>
          <span className="tap-continue">{t('tap.continue')}</span>
        </motion.button>
      )}

      <AnimatePresence>{quote && <QuoteBanner quote={quote} />}</AnimatePresence>
    </div>
  )
}
