import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { loadTimeState, recordTimeGuess } from '../lib/timeProgress.js'
import { hapticSuccess, hapticError } from '../lib/haptics.js'
import { burstSmall, burstCelebration } from '../lib/confetti.js'
import { useLang } from '../lib/i18n.jsx'
import { maybePickQuote } from '../lib/quotes.js'
import QuoteBanner from '../components/QuoteBanner.jsx'

const TARGETS = [3, 4, 5, 6, 7, 8]
const TOLERANCE_SEC = 0.5
const ADVANCE_DELAY_MS = 1800

export default function TimeTrain() {
  const { t } = useLang()
  const [state, setState] = useState(() => loadTimeState())
  const [target, setTarget] = useState(TARGETS[0])
  const [phase, setPhase] = useState('ready') // ready | waiting | revealed
  const [elapsed, setElapsed] = useState(null)
  const [quote, setQuote] = useState(null)

  const startedAtRef = useRef(0)
  const advanceRef = useRef(null)

  const drawNext = useCallback(() => {
    setTarget(TARGETS[Math.floor(Math.random() * TARGETS.length)])
    setPhase('ready')
    setElapsed(null)
    setQuote(null)
  }, [])

  useEffect(() => {
    drawNext()
    return () => clearTimeout(advanceRef.current)
  }, [drawNext])

  function start() {
    startedAtRef.current = Date.now()
    setPhase('waiting')
  }

  function stop() {
    if (phase !== 'waiting') return
    const secs = (Date.now() - startedAtRef.current) / 1000
    setElapsed(secs)
    setPhase('revealed')
    const diff = Math.abs(secs - target)
    const correct = diff <= TOLERANCE_SEC
    const pickedQuote = maybePickQuote()
    setQuote(pickedQuote)
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
    setState(recordTimeGuess(state, correct))
    if (!pickedQuote) {
      advanceRef.current = setTimeout(drawNext, ADVANCE_DELAY_MS)
    }
  }

  const accuracy = state.totalGuesses > 0 ? Math.round((state.totalCorrect / state.totalGuesses) * 100) : 0
  const diff = elapsed !== null ? Math.abs(elapsed - target) : null
  const correct = diff !== null && diff <= TOLERANCE_SEC

  return (
    <div className="cardtrain-page">
      <div className="train-hud">
        <Link to="/time" className="back-link">{t('back.menu')}</Link>
        <div className="hud-stats">
          <span>
            {t('train.streak')} <motion.strong key={state.streak} initial={{ scale: 1.5 }} animate={{ scale: 1 }}>{state.streak}</motion.strong>
          </span>
          <span>{t('train.accuracy')} <strong>{accuracy}%</strong></span>
        </div>
      </div>

      {phase !== 'revealed' && (
        <p className="card-prompt">{t('timetrain.target')} <strong>{target}s</strong></p>
      )}

      <div className="time-stage">
        {phase === 'ready' && (
          <motion.button className="time-dot ready" onClick={start} whileTap={{ scale: 0.92 }}>
            {t('timetrain.start')}
          </motion.button>
        )}
        {phase === 'waiting' && (
          <motion.button
            className="time-dot waiting"
            onClick={stop}
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          >
            {t('timetrain.tapNow')}
          </motion.button>
        )}
        {phase === 'revealed' && (
          <div className={`time-result ${correct ? 'correct' : 'incorrect'}`}>
            <p className="feedback">{correct ? t('timetrain.correct') : t('timetrain.incorrect')}</p>
            <p className="time-result-line">{t('timetrain.target')} <strong>{target}s</strong></p>
            <p className="time-result-line">{t('timetrain.yours')} <strong>{elapsed.toFixed(2)}s</strong></p>
            <p className="time-result-line">{t('timetrain.off')} <strong>{diff.toFixed(2)}s</strong></p>
          </div>
        )}
      </div>

      <QuoteBanner quote={quote} />
      {quote && phase === 'revealed' && (
        <button className="tap-continue-btn" onClick={drawNext}>{t('tap.continue')}</button>
      )}
    </div>
  )
}
