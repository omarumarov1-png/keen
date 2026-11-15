import { useEffect, useRef, useState } from 'react'
import { loadTimeState, recordTimeGuess } from '../lib/timeProgress.js'
import { hapticSuccess, hapticError, hapticTap } from '../lib/haptics.js'
import { useLang } from '../lib/i18n.jsx'
import TrainShell from '../components/TrainShell.jsx'
import TapZones from '../components/TapZones.jsx'
import { READY_LOCK_MS } from '../lib/eyesFree.jsx'

const TARGETS = [3, 4, 5, 6, 7, 8]
const TOLERANCE_SEC = 0.5
const ADVANCE_DELAY_MS = 1800

function randomTarget() {
  return TARGETS[Math.floor(Math.random() * TARGETS.length)]
}

export default function TimeTrain() {
  const { t } = useLang()
  const [state, setState] = useState(() => loadTimeState())
  // target/phase/elapsed in one atomic state object
  const [play, setPlay] = useState(() => ({ target: randomTarget(), phase: 'ready', elapsed: null }))
  const { target, phase, elapsed } = play

  const startedAtRef = useRef(0)
  const advanceRef = useRef(null)
  const unlockRef = useRef(null)
  const lockRef = useRef(false)
  const [locked, setLocked] = useState(false)

  function lockFor(ms) {
    lockRef.current = true
    setLocked(true)
    clearTimeout(unlockRef.current)
    unlockRef.current = setTimeout(() => {
      lockRef.current = false
      setLocked(false)
    }, ms)
  }

  useEffect(() => () => {
    clearTimeout(advanceRef.current)
    clearTimeout(unlockRef.current)
  }, [])

  function drawNext() {
    setPlay({ target: randomTarget(), phase: 'ready', elapsed: null })
    lockFor(READY_LOCK_MS)
  }

  function onZone() {
    if (lockRef.current) return
    if (phase === 'ready') {
      hapticTap()
      startedAtRef.current = performance.now()
      setPlay((p) => ({ ...p, phase: 'waiting' }))
      lockFor(READY_LOCK_MS) // a double tap must not start AND stop
      return
    }
    if (phase !== 'waiting') return
    const secs = (performance.now() - startedAtRef.current) / 1000
    const correct = Math.abs(secs - target) <= TOLERANCE_SEC
    lockRef.current = true
    setLocked(true)
    clearTimeout(unlockRef.current)
    if (correct) hapticSuccess()
    else hapticError()
    setPlay((p) => ({ ...p, phase: 'revealed', elapsed: secs }))
    setState(recordTimeGuess(state, correct))
    advanceRef.current = setTimeout(drawNext, ADVANCE_DELAY_MS)
  }

  const accuracy = state.totalGuesses > 0 ? Math.round((state.totalCorrect / state.totalGuesses) * 100) : 0
  const diff = elapsed !== null ? elapsed - target : null
  const result = diff !== null ? (Math.abs(diff) <= TOLERANCE_SEC ? 'right' : 'wrong') : null

  const stats = [
    { key: 'streak', label: t('hud.streak'), value: state.streak },
    { key: 'acc', label: t('hud.accuracy'), value: `${accuracy}%` },
  ]

  const zone = {
    id: 'go',
    tone: phase === 'waiting' ? 'time-live' : 'time',
    glyph:
      phase === 'ready' ? (
        <svg className="zone-disc" viewBox="0 0 100 100"><path d="M34 22v56l46-28Z" fill="currentColor" /></svg>
      ) : phase === 'waiting' ? (
        <span className="time-pulse" />
      ) : (
        <span className="zone-big-text">{`${diff > 0 ? '+' : ''}${diff.toFixed(2)}s`}</span>
      ),
    label: phase === 'ready' ? t('timetrain.start') : phase === 'waiting' ? t('timetrain.tapNow') : null,
  }

  return (
    <TrainShell
      backTo="/time"
      stats={stats}
      zones={
        <TapZones
          layout="single"
          zones={[zone]}
          onPick={onZone}
          locked={locked}
          feedback={result ? { picked: 'go', result } : null}
        />
      }
    >
      <div className={`time-readout${result ? ` result-${result}` : ''}`}>
        <span className="time-readout-label">{t('timetrain.target')}</span>
        <span className="time-readout-value">{target}<small>s</small></span>
        <span className="time-readout-sub">
          {phase === 'revealed' ? `${t('timetrain.yours')} ${elapsed.toFixed(2)}s` : ' '}
        </span>
      </div>
    </TrainShell>
  )
}
