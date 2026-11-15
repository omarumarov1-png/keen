import { useCallback, useEffect, useRef, useState } from 'react'
import { buildDeck, shuffle } from '../lib/cards.js'
import { loadSuitState, recordSuitGuess } from '../lib/suitProgress.js'
import { hapticSuccess, hapticError } from '../lib/haptics.js'
import { useLang } from '../lib/i18n.jsx'
import PlayingCard from '../components/PlayingCard.jsx'
import TrainShell from '../components/TrainShell.jsx'
import TapZones from '../components/TapZones.jsx'
import { suitZones, REVEAL_MS, READY_LOCK_MS, edgeTone } from '../lib/eyesFree.jsx'

export default function SuitTrain() {
  const { t } = useLang()
  const [state, setState] = useState(() => loadSuitState())
  // See CardTrain.jsx for why current/phase/lastGuess are bundled into one
  // state object instead of separate useState calls: a real leak was caught
  // on-device where the next round's card briefly rendered while the
  // previous round's feedback text was still showing.
  const [round, setRound] = useState({ current: null, phase: 'guessing', lastGuess: null })
  const { current, phase, lastGuess } = round

  const deckRef = useRef([])
  const indexRef = useRef(0)
  const advanceRef = useRef(null)
  const unlockRef = useRef(null)
  // See CardTrain.jsx: synchronous lock against double answers.
  const lockRef = useRef(false)
  const [locked, setLocked] = useState(false)

  const drawNext = useCallback(() => {
    if (indexRef.current >= deckRef.current.length) {
      // no jokers here -- a joker has no suit among the 4 options
      deckRef.current = shuffle(buildDeck({ includeJokers: false }))
      indexRef.current = 0
    }
    const card = deckRef.current[indexRef.current]
    indexRef.current += 1
    setRound({ current: card, phase: 'guessing', lastGuess: null })
    clearTimeout(unlockRef.current)
    unlockRef.current = setTimeout(() => {
      lockRef.current = false
      setLocked(false)
    }, READY_LOCK_MS)
  }, [])

  useEffect(() => {
    deckRef.current = shuffle(buildDeck({ includeJokers: false }))
    indexRef.current = 0
    lockRef.current = false
    drawNext()
    return () => {
      clearTimeout(advanceRef.current)
      clearTimeout(unlockRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function guess(suitId) {
    if (lockRef.current || phase !== 'guessing' || !current) return
    lockRef.current = true
    setLocked(true)
    const correct = suitId === current.suit
    if (correct) hapticSuccess()
    else hapticError()
    setRound((r) => ({ ...r, phase: 'revealed', lastGuess: suitId }))
    setState(recordSuitGuess(state, correct))
    advanceRef.current = setTimeout(drawNext, REVEAL_MS)
  }

  if (!current) return <div className="train-shell" />

  const accuracy = state.totalGuesses > 0 ? Math.round((state.totalCorrect / state.totalGuesses) * 100) : 0
  const edge = state.totalGuesses >= 8 ? accuracy - 25 : null
  const revealed = phase === 'revealed'
  const result = revealed ? (lastGuess === current.suit ? 'right' : 'wrong') : null

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
          layout="quad"
          zones={suitZones(t)}
          onPick={guess}
          locked={locked}
          feedback={revealed ? { picked: lastGuess, result, actual: current.suit } : null}
        />
      }
    >
      <PlayingCard revealed={revealed} card={current} size="stage" colorMode="suit" result={result} />
    </TrainShell>
  )
}
