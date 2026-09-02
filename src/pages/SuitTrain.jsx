import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { buildDeck, shuffle, SUITS } from '../lib/cards.js'
import { loadSuitState, recordSuitGuess } from '../lib/suitProgress.js'
import { hapticSuccess, hapticError } from '../lib/haptics.js'
import { burstSmall, burstCelebration } from '../lib/confetti.js'
import { useLang, suitNameForFeedback } from '../lib/i18n.jsx'
import { maybePickQuote } from '../lib/quotes.js'
import PlayingCard from '../components/PlayingCard.jsx'
import QuoteBanner from '../components/QuoteBanner.jsx'

export default function SuitTrain() {
  const { t, lang } = useLang()
  const [state, setState] = useState(() => loadSuitState())
  const [current, setCurrent] = useState(null)
  const [phase, setPhase] = useState('guessing') // guessing | revealed
  const [lastGuess, setLastGuess] = useState(null)
  const [quote, setQuote] = useState(null)

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
    setQuote(null)
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
    const pickedQuote = maybePickQuote()
    setQuote(pickedQuote)
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
    if (!pickedQuote) {
      advanceRef.current = setTimeout(drawNext, 1500)
    }
  }

  if (!current) return <p>{t('cardtrain.shuffling')}</p>

  const accuracy = state.totalGuesses > 0 ? Math.round((state.totalCorrect / state.totalGuesses) * 100) : 0
  const edge = state.totalGuesses >= 8 ? accuracy - 25 : null

  return (
    <div className="cardtrain-page">
      <div className="train-hud">
        <Link to="/cards" className="back-link">{t('back.menu')}</Link>
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
          key={phase === 'guessing' ? 'guessing' : lastGuess === current.suit ? 'correct' : 'incorrect'}
          className="card-prompt"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.18 }}
        >
          {phase === 'guessing'
            ? t('suittrain.prompt')
            : lastGuess === current.suit
              ? t('suittrain.correct')
              : `${t('suittrain.incorrectPrefix')} ${suitNameForFeedback(lang, current.suit)}`}
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
            <span className="suit-name">{t(`suit.${s.id}`)}</span>
          </motion.button>
        ))}
      </div>

      <QuoteBanner quote={quote} />
      {quote && phase === 'revealed' && (
        <button className="tap-continue-btn" onClick={drawNext}>{t('tap.continue')}</button>
      )}
    </div>
  )
}
