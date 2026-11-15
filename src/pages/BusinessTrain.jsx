import { useRef, useState } from 'react'
import { pickRandom, RECENT_WINDOW } from '../lib/businessScenarios.js'
import { loadBusinessState, recordBusinessGuess } from '../lib/businessProgress.js'
import { hapticSuccess, hapticError } from '../lib/haptics.js'
import { useLang } from '../lib/i18n.jsx'
import TrainShell from '../components/TrainShell.jsx'
import TapZones from '../components/TapZones.jsx'
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
  // current/phase/lastGuess in one atomic state object
  const [play, setPlay] = useState(() => ({ current: pickRandom([]), phase: 'guessing', lastGuess: null }))
  const { current, phase, lastGuess } = play
  const recentIds = useRef([])

  const lockRef = useRef(false)
  const unlockRef = useRef(null)

  function drawNext() {
    if (lockRef.current) return
    lockRef.current = true
    recentIds.current = [current.id, ...recentIds.current].slice(0, RECENT_WINDOW)
    setPlay({ current: pickRandom(recentIds.current), phase: 'guessing', lastGuess: null })
    clearTimeout(unlockRef.current)
    unlockRef.current = setTimeout(() => { lockRef.current = false }, READY_LOCK_MS)
  }

  function guess(value) {
    if (lockRef.current || phase !== 'guessing') return
    lockRef.current = true
    const correct = value === current.result
    if (correct) hapticSuccess()
    else hapticError()
    setPlay((p) => ({ ...p, phase: 'revealed', lastGuess: value }))
    setState(recordBusinessGuess(state, correct))
    // This mode is about reading what happened, so the reveal waits for a tap
    // (anywhere on the panel) instead of auto-advancing.
    clearTimeout(unlockRef.current)
    unlockRef.current = setTimeout(() => { lockRef.current = false }, 600)
  }

  const accuracy = state.totalGuesses > 0 ? Math.round((state.totalCorrect / state.totalGuesses) * 100) : 0
  const correct = lastGuess === current.result

  const stats = [
    { key: 'streak', label: t('hud.streak'), value: state.streak },
    { key: 'acc', label: t('hud.accuracy'), value: `${accuracy}%` },
  ]

  if (phase === 'guessing') {
    return (
      <TrainShell
        backTo="/business"
        stats={stats}
        zones={
          <TapZones
            layout="halves"
            zones={[
              { id: 'yes', tone: 'yes', glyph: <Check />, label: t('zone.yes') },
              { id: 'no', tone: 'no', glyph: <Cross />, label: t('zone.no') },
            ]}
            onPick={guess}
          />
        }
      >
        <p className="stage-question">{t('biztrain.prompt')}</p>
      </TrainShell>
    )
  }

  return (
    <TrainShell backTo="/business" stats={stats} className="is-reading">
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
