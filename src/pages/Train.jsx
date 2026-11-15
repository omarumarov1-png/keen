import { useCallback, useEffect, useRef, useState } from 'react'
import { Chessboard } from 'react-chessboard'
import { loadPuzzles, preparePuzzle, pickNextPuzzle } from '../lib/puzzles.js'
import { loadState, recordAttempt } from '../lib/progress.js'
import { hapticSuccess, hapticError } from '../lib/haptics.js'
import { useLang } from '../lib/i18n.jsx'
import TrainShell from '../components/TrainShell.jsx'

const RECENT_WINDOW = 40
const FEEDBACK_DELAY_MS = 1300

export default function Train() {
  const { t } = useLang()
  const [puzzles, setPuzzles] = useState(null)
  const [state, setState] = useState(() => loadState())
  const [current, setCurrent] = useState(null)
  const [selected, setSelected] = useState(null)
  const [legalTargets, setLegalTargets] = useState([])
  const [phase, setPhase] = useState('loading') // loading | showing | correct | incorrect | timeout
  const [timeLeft, setTimeLeft] = useState(0)

  const recentIds = useRef([])
  // The exposure timer is created inside startPuzzle (memoised once), so it
  // calls a resolveAttempt from the first render, where `puzzles` was still
  // null -- a timeout then crashed instead of advancing. Read it from a ref.
  const puzzlesRef = useRef(null)
  const timerRef = useRef(null)
  const advanceRef = useRef(null)

  useEffect(() => {
    loadPuzzles().then((p) => {
      puzzlesRef.current = p
      setPuzzles(p)
    })
    return () => {
      clearInterval(timerRef.current)
      clearTimeout(advanceRef.current)
    }
  }, [])

  const startPuzzle = useCallback(
    (pool, st) => {
      const puzzle = pickNextPuzzle(pool, st.rating, st.history, recentIds.current, st.colorFilter)
      recentIds.current = [puzzle.id, ...recentIds.current].slice(0, RECENT_WINDOW)
      const prepared = preparePuzzle(puzzle)
      setCurrent(prepared)
      setSelected(null)
      setLegalTargets([])
      setPhase('showing')
      setTimeLeft(st.exposureSeconds)

      clearInterval(timerRef.current)
      const startedAt = Date.now()
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startedAt) / 1000
        const left = Math.max(0, st.exposureSeconds - elapsed)
        setTimeLeft(left)
        if (left <= 0) {
          clearInterval(timerRef.current)
          resolveAttempt(prepared, null, st)
        }
      }, 100)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  useEffect(() => {
    if (puzzles) startPuzzle(puzzles, state)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzles])

  useEffect(() => {
    // Dev-only test hook -- statically stripped from production builds by
    // Vite (import.meta.env.DEV is replaced with `false` and dead-code
    // eliminated), so this is never present for real users. Never read
    // solution data from a non-DEV build.
    if (import.meta.env.DEV && current) {
      window.__chessIntuitionDebug = {
        fen: current.positionFen,
        solution: current.solution,
        turn: current.turn,
        phase,
      }
    }
  }, [current, phase])

  function resolveAttempt(puzzle, attemptedUci, st) {
    clearInterval(timerRef.current)
    const correct = attemptedUci === puzzle.solution
    setPhase(attemptedUci === null ? 'timeout' : correct ? 'correct' : 'incorrect')
    if (correct) hapticSuccess()
    else hapticError()
    const next = recordAttempt(st, puzzle, correct)
    setState(next)
    advanceRef.current = setTimeout(() => {
      startPuzzle(puzzlesRef.current, next)
    }, FEEDBACK_DELAY_MS)
  }

  function squareStyleFor(square) {
    const styles = {}
    if (selected === square) {
      styles.backgroundColor = 'rgba(232, 176, 75, 0.6)'
    }
    if (legalTargets.includes(square)) {
      styles.backgroundColor = 'rgba(43, 214, 123, 0.32)'
    }
    if (phase !== 'showing' && current) {
      const [from, to] = [current.solution.slice(0, 2), current.solution.slice(2, 4)]
      if (square === from || square === to) {
        styles.backgroundColor = phase === 'correct' ? 'rgba(43, 214, 123, 0.55)' : 'rgba(255, 90, 78, 0.5)'
      }
    }
    return styles
  }

  function handleSquareClick({ piece, square }) {
    if (phase !== 'showing' || !current) return

    if (selected && legalTargets.includes(square)) {
      const uci = selected + square
      setSelected(null)
      setLegalTargets([])
      resolveAttempt(current, uci, state)
      return
    }

    if (piece && piece.pieceType[0] === current.turn) {
      const moves = current.chess.moves({ square, verbose: true })
      setSelected(square)
      setLegalTargets(moves.map((m) => m.to))
    } else {
      setSelected(null)
      setLegalTargets([])
    }
  }

  function handlePieceDrop({ sourceSquare, targetSquare }) {
    if (phase !== 'showing' || !current || !targetSquare) return false
    const moves = current.chess.moves({ square: sourceSquare, verbose: true })
    const legal = moves.some((m) => m.to === targetSquare)
    if (!legal) return false
    setSelected(null)
    setLegalTargets([])
    resolveAttempt(current, sourceSquare + targetSquare, state)
    return true
  }

  if (!current) return <div className="train-shell"><p className="stage-question">{t('train.loading')}</p></div>

  const accuracy = state.totalAttempts > 0 ? Math.round((state.totalCorrect / state.totalAttempts) * 100) : 0
  const stats = [
    { key: 'rating', label: t('hud.rating'), value: state.rating },
    { key: 'streak', label: t('hud.streak'), value: state.streak },
    { key: 'acc', label: t('hud.accuracy'), value: `${accuracy}%` },
  ]

  return (
    <TrainShell backTo="/chess" stats={stats} className="chess-shell">
      <div className="chess-col">
        <div className={`timer-bar-track ${phase !== 'showing' ? 'paused' : ''}`}>
          <div
            className="timer-bar-fill"
            style={{ width: `${(timeLeft / state.exposureSeconds) * 100}%` }}
          />
        </div>

        <div className={`board-wrap${phase === 'correct' ? ' result-right' : phase === 'incorrect' || phase === 'timeout' ? ' result-wrong' : ''}`}>
          <Chessboard
            options={{
              position: current.positionFen,
              boardOrientation: current.turn === 'w' ? 'white' : 'black',
              onSquareClick: handleSquareClick,
              onPieceDrop: handlePieceDrop,
              lightSquareStyle: { backgroundColor: '#ece2cc' },
              darkSquareStyle: { backgroundColor: '#a47e55' },
              squareStyles: Object.fromEntries(
                [selected, ...legalTargets, current.solution.slice(0, 2), current.solution.slice(2, 4)]
                  .filter(Boolean)
                  .map((sq) => [sq, squareStyleFor(sq)])
              ),
              showAnimations: false,
            }}
          />
        </div>

        <div className="feedback-row">
          {phase === 'correct' && <p className="feedback correct">{t('train.correct')}</p>}
          {phase === 'incorrect' && <p className="feedback incorrect">{t('train.incorrect')}</p>}
          {phase === 'timeout' && <p className="feedback incorrect">{t('train.timeout')}</p>}
          {phase === 'showing' && (
            <p className="feedback">
              <span className={`turn-dot turn-${current.turn}`} aria-hidden="true" />
              {t('train.findMoveFor')} {current.turn === 'w' ? t('train.white') : t('train.black')}
            </p>
          )}
        </div>
      </div>
    </TrainShell>
  )
}
