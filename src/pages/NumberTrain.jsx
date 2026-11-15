import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { generateRound } from '../lib/numbers.js'
import { loadNumberState, recordNumberGuess } from '../lib/numberProgress.js'
import { hapticSuccess, hapticError } from '../lib/haptics.js'
import TrainShell from '../components/TrainShell.jsx'
import TapZones from '../components/TapZones.jsx'
import TrainHud from '../components/TrainHud.jsx'
import { newSessionId, currentSession, CHANCE } from '../lib/stats.js'
import { REVEAL_MS, READY_LOCK_MS } from '../lib/eyesFree.jsx'

export default function NumberTrain() {
  const reduce = useReducedMotion()
  const [state, setState] = useState(() => loadNumberState())
  const [sessionId] = useState(newSessionId)
  // round/phase/lastGuess in one state object (same reasoning as CardTrain):
  // the next round's target can never render next to the previous reveal.
  const [play, setPlay] = useState({ round: null, phase: 'guessing', lastGuess: null })
  const { round, phase, lastGuess } = play

  const advanceRef = useRef(null)
  const unlockRef = useRef(null)
  const lockRef = useRef(false)
  const [locked, setLocked] = useState(false)

  const drawNext = useCallback((digitMode) => {
    setPlay({ round: generateRound(digitMode), phase: 'guessing', lastGuess: null })
    clearTimeout(unlockRef.current)
    unlockRef.current = setTimeout(() => {
      lockRef.current = false
      setLocked(false)
    }, READY_LOCK_MS)
  }, [])

  useEffect(() => {
    lockRef.current = false
    drawNext(state.digitMode)
    return () => {
      clearTimeout(advanceRef.current)
      clearTimeout(unlockRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function guess(value) {
    if (lockRef.current || phase !== 'guessing' || !round) return
    lockRef.current = true
    setLocked(true)
    const correct = value === round.target
    if (correct) hapticSuccess()
    else hapticError()
    setPlay((p) => ({ ...p, phase: 'revealed', lastGuess: value }))
    const next = recordNumberGuess(state, correct, sessionId)
    setState(next)
    advanceRef.current = setTimeout(() => drawNext(next.digitMode), REVEAL_MS)
  }

  if (!round) return <div className="train-shell" />

  const revealed = phase === 'revealed'
  const result = revealed ? (lastGuess === round.target ? 'right' : 'wrong') : null

  const hud = (
    <TrainHud
      session={currentSession(state, sessionId)}
      total={state.totalGuesses}
      chance={CHANCE.numbers}
      streak={state.streak}
      best={state.bestStreak}
      recent={state.recent}
    />
  )

  const zones = round.options.map((opt) => ({
    id: opt,
    tone: 'number',
    glyph: <span className={`zone-big-text digits-${String(opt).length}`}>{opt}</span>,
    aria: String(opt),
  }))

  return (
    <TrainShell
      backTo="/numbers"
      hud={hud}
      zones={
        <TapZones
          layout="quad"
          zones={zones}
          onPick={guess}
          locked={locked}
          answer={!revealed ? round.target : null}
          feedback={revealed ? { picked: lastGuess, result, actual: round.target } : null}
        />
      }
    >
      <div className={`flip-scene flip-scene-stage number-scene${result ? ` result-${result}` : ''}`}>
        <motion.div
          className="flip-inner"
          animate={{ rotateY: revealed ? 180 : 0 }}
          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 24 }}
        >
          <div className="flip-face flip-face-back">
            <div className="card-back-pattern">
              <span className="card-back-frame" aria-hidden="true" />
              <span className="number-back-mark">?</span>
            </div>
          </div>
          <div className="flip-face flip-face-front playing-card-face number-reveal-face">
            {revealed && (
              <span className={`number-reveal-value digits-${String(round.target).length}`}>{round.target}</span>
            )}
          </div>
        </motion.div>
      </div>
    </TrainShell>
  )
}
