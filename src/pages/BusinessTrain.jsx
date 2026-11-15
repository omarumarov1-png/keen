import { useRef, useState } from 'react'
import { pickRandom, RECENT_WINDOW } from '../lib/businessScenarios.js'
import { loadBusinessState, recordBusinessGuess } from '../lib/businessProgress.js'
import { hapticSuccess, hapticError } from '../lib/haptics.js'
import { useLang } from '../lib/i18n.jsx'
import TrainShell from '../components/TrainShell.jsx'
import TapZones from '../components/TapZones.jsx'
import TrainHud from '../components/TrainHud.jsx'
import { newSessionId, currentSession, CHANCE } from '../lib/stats.js'
import { READY_LOCK_MS } from '../lib/eyesFree.jsx'

function Check() {
  return <svg className="zone-disc" viewBox="0 0 100 100"><path d="M22 52l18 18 38-40" fill="none" stroke="currentColor" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function Cross() {
  return <svg className="zone-disc" viewBox="0 0 100 100"><path d="M28 28l44 44M72 28L28 72" fill="none" stroke="currentColor" strokeWidth="11" strokeLinecap="round" /></svg>
}

export default function BusinessTrain() {
  const { t } = useLang()
  const [state, setState] = useState(() => loadBusinessState())
  const [sessionId] = useState(newSessionId)
  // current/phase/lastGuess in one atomic state object
  const [play, setPlay] = useState(() => ({ current: pickRandom([]), phase: 'guessing', lastGuess: null }))
  const { current, phase, lastGuess } = play
  const recentIds = useRef([])

  const lockRef = useRef(false)
  const unlockRef = useRef(null)
  // mirrors lockRef for rendering: the yes/no switches are disabled while
  // locked, so a too-early tap gives no tick
  const [locked, setLocked] = useState(false)

  function drawNext() {
    if (lockRef.current) return
    lockRef.current = true
    setLocked(true)
    recentIds.current = [current.id, ...recentIds.current].slice(0, RECENT_WINDOW)
    setPlay({ current: pickRandom(recentIds.current), phase: 'guessing', lastGuess: null })
    clearTimeout(unlockRef.current)
    unlockRef.current = setTimeout(() => {
      lockRef.current = false
      setLocked(false)
    }, READY_LOCK_MS)
  }

  function guess(value) {
    if (lockRef.current || phase !== 'guessing') return
    lockRef.current = true
    const correct = value === current.result
    if (correct) hapticSuccess()
    else hapticError()
    setPlay((p) => ({ ...p, phase: 'revealed', lastGuess: value }))
    setState(recordBusinessGuess(state, correct, sessionId))
    // This mode is about reading what happened, so the reveal waits for a tap
    // (anywhere on the panel) instead of auto-advancing.
    clearTimeout(unlockRef.current)
    unlockRef.current = setTimeout(() => { lockRef.current = false }, 600)
  }

  const correct = lastGuess === current.result

  const hud = (
    <TrainHud
      session={currentSession(state, sessionId)}
      total={state.totalGuesses}
      chance={CHANCE.business}
      streak={state.streak}
      best={state.bestStreak}
      recent={state.recent}
    />
  )

  if (phase === 'guessing') {
    return (
      <TrainShell
        backTo="/business"
        hud={hud}
        zones={
          <TapZones
            layout="halves"
            zones={[
              { id: 'yes', tone: 'yes', glyph: <Check />, label: t('zone.yes') },
              { id: 'no', tone: 'no', glyph: <Cross />, label: t('zone.no') },
            ]}
            onPick={guess}
            locked={locked}
          />
        }
      >
        <p className="stage-question">{t('biztrain.prompt')}</p>
      </TrainShell>
    )
  }

  return (
    <TrainShell backTo="/business" hud={hud} className="is-reading">
      <button type="button" className={`business-reveal result-${correct ? 'right' : 'wrong'}`} onClick={drawNext}>
        <span className="business-verdict">{correct ? t('biztrain.correct') : t('biztrain.incorrect')}</span>
        <span className="business-situation">{current.situation}</span>
        <span className="business-outcome-label">{t('biztrain.outcome')}</span>
        <span className="business-outcome">{current.outcome}</span>
        <span className="tap-continue">{t('tap.continue')}</span>
      </button>
    </TrainShell>
  )
}
