import { useCallback, useEffect, useRef, useState } from 'react'
import { buildDeck, shuffle } from '../lib/cards.js'
import { loadConfidenceState, recordConfidenceGuess } from '../lib/confidenceProgress.js'
import { hapticSuccess, hapticError, hapticTap } from '../lib/haptics.js'
import { useLang } from '../lib/i18n.jsx'
import PlayingCard from '../components/PlayingCard.jsx'
import TrainShell from '../components/TrainShell.jsx'
import TapZones from '../components/TapZones.jsx'
import { bwZones, stakeZones, REVEAL_MS, READY_LOCK_MS } from '../lib/eyesFree.jsx'

export default function ConfidenceTrain() {
  const { t } = useLang()
  const [state, setState] = useState(() => loadConfidenceState())
  // See CardTrain.jsx for why current/stake/phase/lastGuess are bundled
  // into one state object instead of separate useState calls: a real leak
  // was caught on-device where the next round's card briefly rendered
  // while the previous round's feedback text was still showing.
  const [round, setRound] = useState({ current: null, stake: null, phase: 'staking', lastGuess: null })
  const { current, stake, phase, lastGuess } = round

  const deckRef = useRef([])
  const indexRef = useRef(0)
  const advanceRef = useRef(null)
  const unlockRef = useRef(null)
  // Synchronous lock (see CardTrain.jsx). Also briefly closed after the stake
  // pick, because the stake zones and the colour zones share the same screen
  // area -- a double tap must not become "stake + guess".
  const lockRef = useRef(false)
  const [locked, setLocked] = useState(false)

  const lockFor = useCallback((ms) => {
    lockRef.current = true
    setLocked(true)
    clearTimeout(unlockRef.current)
    unlockRef.current = setTimeout(() => {
      lockRef.current = false
      setLocked(false)
    }, ms)
  }, [])

  const drawNext = useCallback(() => {
    if (indexRef.current >= deckRef.current.length) {
      deckRef.current = shuffle(buildDeck({ includeJokers: true }))
      indexRef.current = 0
    }
    const card = deckRef.current[indexRef.current]
    indexRef.current += 1
    setRound({ current: card, stake: null, phase: 'staking', lastGuess: null })
    lockFor(READY_LOCK_MS)
  }, [lockFor])

  useEffect(() => {
    deckRef.current = shuffle(buildDeck({ includeJokers: true }))
    indexRef.current = 0
    drawNext()
    return () => {
      clearTimeout(advanceRef.current)
      clearTimeout(unlockRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function chooseStake(value) {
    if (lockRef.current || phase !== 'staking') return
    hapticTap()
    setRound((r) => ({ ...r, stake: value, phase: 'guessing' }))
    lockFor(READY_LOCK_MS)
  }

  function guess(color) {
    if (lockRef.current || phase !== 'guessing' || !current || !stake) return
    lockRef.current = true
    setLocked(true)
    clearTimeout(unlockRef.current)
    const correct = color === current.color
    if (correct) hapticSuccess()
    else hapticError()
    setRound((r) => ({ ...r, phase: 'revealed', lastGuess: color }))
    setState(recordConfidenceGuess(state, correct, stake))
    advanceRef.current = setTimeout(drawNext, REVEAL_MS)
  }

  if (!current) return <div className="train-shell" />

  const accuracy = state.totalGuesses > 0 ? Math.round((state.totalCorrect / state.totalGuesses) * 100) : 0
  const revealed = phase === 'revealed'
  const result = revealed ? (lastGuess === current.color ? 'right' : 'wrong') : null

  const stats = [
    { key: 'score', label: t('confidence.score'), value: state.score },
    { key: 'acc', label: t('hud.accuracy'), value: `${accuracy}%` },
  ]

  const zones =
    phase === 'staking' ? (
      <TapZones key="stake" layout="thirds" zones={stakeZones(t)} onPick={chooseStake} locked={locked} />
    ) : (
      <TapZones
        key="color"
        layout="halves"
        zones={bwZones(t)}
        onPick={guess}
        locked={locked}
        feedback={revealed ? { picked: lastGuess, result, actual: current.color } : null}
      />
    )

  return (
    <TrainShell backTo="/confidence" stats={stats} zones={zones}>
      <div className="stake-stage">
        <PlayingCard revealed={revealed} card={current} size="stage" result={result} />
        <span className={`stake-badge${stake ? ' is-set' : ''}${result ? ` result-${result}` : ''}`} aria-live="polite">
          {stake ? (result ? `${result === 'right' ? '+' : '−'}${stake}` : `×${stake}`) : t('confidence.stakeShort')}
        </span>
      </div>
    </TrainShell>
  )
}
