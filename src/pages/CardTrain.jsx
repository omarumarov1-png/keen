import { useCallback, useEffect, useRef, useState } from 'react'
import { buildDeck, shuffle } from '../lib/cards.js'
import { loadCardState, recordGuess } from '../lib/cardProgress.js'
import { hapticSuccess, hapticError } from '../lib/haptics.js'
import { useLang } from '../lib/i18n.jsx'
import PlayingCard from '../components/PlayingCard.jsx'
import TrainShell from '../components/TrainShell.jsx'
import TapZones from '../components/TapZones.jsx'
import { bwZones, REVEAL_MS, READY_LOCK_MS, edgeTone } from '../lib/eyesFree.jsx'

export default function CardTrain() {
  const { t } = useLang()
  const [state, setState] = useState(() => loadCardState())
  // current/phase/lastGuess live in ONE state object, updated via a
  // single setRound call each time. Two separate useState calls updated
  // together (even in the same synchronous function body) are not a hard
  // guarantee against an observer seeing them apply in different renders on
  // every JS engine/timing profile -- a real leak was caught on-device where
  // the next round's card briefly rendered while the previous round's
  // "Correct!"/"Not quite" text was still showing. Bundling them into one
  // object makes that class of bug structurally impossible: there is only
  // ever one state value to read, so it can never be self-inconsistent.
  const [round, setRound] = useState({ current: null, phase: 'guessing', lastGuess: null })
  const { current, phase, lastGuess } = round

  const deckRef = useRef([])
  const indexRef = useRef(0)
  const advanceRef = useRef(null)
  const unlockRef = useRef(null)
  // Synchronous input lock: set the instant an answer is accepted, cleared a
  // moment after the next card is dealt. Rapid double taps / multi-touch can
  // never count twice, even before React re-renders.
  const lockRef = useRef(false)
  const [locked, setLocked] = useState(false)

  const drawNext = useCallback(() => {
    if (indexRef.current >= deckRef.current.length) {
      deckRef.current = shuffle(buildDeck({ includeJokers: true }))
      indexRef.current = 0
    }
    const card = deckRef.current[indexRef.current]
    indexRef.current += 1
    setRound({ current: card, phase: 'guessing', lastGuess: null })
    // keep input closed while the card swings back face-down
    clearTimeout(unlockRef.current)
    unlockRef.current = setTimeout(() => {
      lockRef.current = false
      setLocked(false)
    }, READY_LOCK_MS)
  }, [])

  useEffect(() => {
    deckRef.current = shuffle(buildDeck({ includeJokers: true }))
    indexRef.current = 0
    lockRef.current = false
    drawNext()
    return () => {
      clearTimeout(advanceRef.current)
      clearTimeout(unlockRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function guess(color) {
    if (lockRef.current || phase !== 'guessing' || !current) return
    lockRef.current = true
    setLocked(true)
    const correct = color === current.color
    // haptic first, synchronously inside the tap (user gesture)
    if (correct) hapticSuccess()
    else hapticError()
    setRound((r) => ({ ...r, phase: 'revealed', lastGuess: color }))
    setState(recordGuess(state, correct))
    // always hands-free: the next card comes on its own
    advanceRef.current = setTimeout(drawNext, REVEAL_MS)
  }

  if (!current) return <div className="train-shell" />

  const accuracy = state.totalGuesses > 0 ? Math.round((state.totalCorrect / state.totalGuesses) * 100) : 0
  const edge = state.totalGuesses >= 10 ? accuracy - 50 : null
  const revealed = phase === 'revealed'
  const result = revealed ? (lastGuess === current.color ? 'right' : 'wrong') : null

  const stats = [
    { key: 'streak', label: t('hud.streak'), value: state.streak },
    { key: 'acc', label: t('hud.accuracy'), value: `${accuracy}%` },
  ]
  if (edge !== null) stats.push({ key: 'edge', label: t('hud.edge'), value: `${edge > 0 ? '+' : ''}${edge}`, tone: edgeTone(edge) })

  return (
    <TrainShell
      backTo="/cards"
      stats={stats}
      zones={
        <TapZones
          layout="halves"
          zones={bwZones(t)}
          onPick={guess}
          locked={locked}
          feedback={revealed ? { picked: lastGuess, result, actual: current.color } : null}
        />
      }
    >
      <PlayingCard revealed={revealed} card={current} size="stage" result={result} />
    </TrainShell>
  )
}
