import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Chessboard } from 'react-chessboard'
import { loadPuzzles, preparePuzzle, pickNextPuzzle } from '../lib/puzzles.js'
import { loadState, recordAttempt } from '../lib/progress.js'
import { hapticSuccess, hapticError } from '../lib/haptics.js'
import { useLang } from '../lib/i18n.jsx'
import { maybePickQuote } from '../lib/quotes.js'
import QuoteBanner from '../components/QuoteBanner.jsx'

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
  const [quote, setQuote] = useState(null)

  const recentIds = useRef([])
  const timerRef = useRef(null)
  const advanceRef = useRef(null)

  useEffect(() => {
    loadPuzzles().then(setPuzzles)
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
      setQuote(null)

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
    setQuote(maybePickQuote())
    if (correct) hapticSuccess()
    else hapticError()
    const next = recordAttempt(st, puzzle, correct)
    setState(next)
    advanceRef.current = setTimeout(() => {
      startPuzzle(puzzles, next)
    }, FEEDBACK_DELAY_MS)
  }

  function squareStyleFor(square) {
    const styles = {}
    if (selected === square) {
      styles.backgroundColor = 'rgba(255, 215, 0, 0.5)'
    }
    if (legalTargets.includes(square)) {
      styles.backgroundColor = 'rgba(0, 150, 0, 0.25)'
    }
    if (phase !== 'showing' && current) {
      const [from, to] = [current.solution.slice(0, 2), current.solution.slice(2, 4)]
      if (square === from || square === to) {
        styles.backgroundColor = phase === 'correct' ? 'rgba(0, 180, 0, 0.45)' : 'rgba(200, 0, 0, 0.35)'
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

  if (!current) return <p>{t('train.loading')}</p>

  const accuracy = state.totalAttempts > 0 ? Math.round((state.totalCorrect / state.totalAttempts) * 100) : 0

  return (
    <div className="train-page">
      <div className="train-hud">
        <Link to="/chess" className="back-link">{t('back.menu')}</Link>
        <div className="hud-stats">
          <span>{t('train.rating')} <strong>{state.rating}</strong></span>
          <span>{t('train.streak')} <strong>{state.streak}</strong></span>
          <span>{t('train.accuracy')} <strong>{accuracy}%</strong></span>
        </div>
      </div>

      <div className={`timer-bar-track ${phase !== 'showing' ? 'paused' : ''}`}>
        <div
          className="timer-bar-fill"
          style={{ width: `${(timeLeft / state.exposureSeconds) * 100}%` }}
        />
      </div>

      <div className="board-wrap">
        <Chessboard
          options={{
            position: current.positionFen,
            boardOrientation: current.turn === 'w' ? 'white' : 'black',
            onSquareClick: handleSquareClick,
            onPieceDrop: handlePieceDrop,
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
            {t('train.findMoveFor')} {current.turn === 'w' ? t('train.white') : t('train.black')}
          </p>
        )}
      </div>

      <QuoteBanner quote={quote} />
    </div>
  )
}
