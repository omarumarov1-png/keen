import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { buildDeck, shuffle } from '../lib/cards.js'
import { loadConfidenceState, recordConfidenceGuess } from '../lib/confidenceProgress.js'
import { hapticSuccess, hapticError } from '../lib/haptics.js'
import { burstSmall, burstCelebration } from '../lib/confetti.js'
import { useLang } from '../lib/i18n.jsx'
import { maybePickQuote } from '../lib/quotes.js'
import PlayingCard from '../components/PlayingCard.jsx'
import QuoteBanner from '../components/QuoteBanner.jsx'

const STAKES = [1, 2, 3]
const ADVANCE_DELAY_MS = 1600

export default function ConfidenceTrain() {
  const { t } = useLang()
  const [state, setState] = useState(() => loadConfidenceState())
  const [current, setCurrent] = useState(null)
  const [stake, setStake] = useState(null)
  const [phase, setPhase] = useState('staking') // staking | guessing | revealed
  const [lastGuess, setLastGuess] = useState(null)
  const [quote, setQuote] = useState(null)

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
    setStake(null)
    setPhase('staking')
    setLastGuess(null)
    setQuote(null)
  }, [])

  useEffect(() => {
    deckRef.current = shuffle(buildDeck({ includeJokers: true }))
    indexRef.current = 0
    drawNext()
    return () => clearTimeout(advanceRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function chooseStake(value) {
    if (phase !== 'staking') return
    setStake(value)
    setPhase('guessing')
  }

  function guess(color) {
    if (phase !== 'guessing' || !current || !stake) return
    setLastGuess(color)
    setPhase('revealed')
    const pickedQuote = maybePickQuote()
    setQuote(pickedQuote)
    const correct = color === current.color
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
    setState(recordConfidenceGuess(state, correct, stake))
    if (!pickedQuote) {
      advanceRef.current = setTimeout(drawNext, ADVANCE_DELAY_MS)
    }
  }

  if (!current) return <p>{t('cardtrain.shuffling')}</p>

  const accuracy = state.totalGuesses > 0 ? Math.round((state.totalCorrect / state.totalGuesses) * 100) : 0
  const correct = lastGuess === current?.color

  return (
    <div className="cardtrain-page">
      <div className="train-hud">
        <Link to="/confidence" className="back-link">{t('back.menu')}</Link>
        <div className="hud-stats">
          <span>{t('confidence.score')} <motion.strong key={state.score} initial={{ scale: 1.5 }} animate={{ scale: 1 }}>{state.score}</motion.strong></span>
          <span>{t('train.accuracy')} <strong>{accuracy}%</strong></span>
        </div>
      </div>

      {phase === 'staking' && (
        <div className="stake-stage">
          <p className="card-prompt">{t('confidence.stakePrompt')}</p>
          <div className="stake-buttons">
            {STAKES.map((s) => (
              <motion.button key={s} className="stake-btn" onClick={() => chooseStake(s)} whileTap={{ scale: 0.92 }}>
                <span className="stake-value">×{s}</span>
                <span className="stake-label">{t(`confidence.stake${s}`)}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {phase !== 'staking' && (
        <>
          <p className="card-prompt">
            {phase === 'guessing'
              ? t('cardtrain.prompt')
              : correct
                ? t('confidence.won', { stake })
                : t('confidence.lost', { stake })}
          </p>

          <div className="card-stage">
            <PlayingCard revealed={phase === 'revealed'} card={current} />
          </div>

          <div className="guess-buttons">
            <motion.button
              className="guess-btn guess-black"
              onClick={() => guess('black')}
              disabled={phase !== 'guessing'}
              whileTap={{ scale: 0.94 }}
            >
              {t('cardtrain.guessBlack')}
            </motion.button>
            <motion.button
              className="guess-btn guess-white"
              onClick={() => guess('white')}
              disabled={phase !== 'guessing'}
              whileTap={{ scale: 0.94 }}
            >
              {t('cardtrain.guessWhite')}
            </motion.button>
          </div>
        </>
      )}

      <QuoteBanner quote={quote} />
      {quote && phase === 'revealed' && (
        <button className="tap-continue-btn" onClick={drawNext}>{t('tap.continue')}</button>
      )}
    </div>
  )
}
