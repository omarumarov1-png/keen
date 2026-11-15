import { normalizeStats, trackResult } from './stats.js'

const KEY = 'chess-intuition-time-progress-v1'

function defaultState() {
  return {
    streak: 0,
    bestStreak: 0,
    totalGuesses: 0,
    totalCorrect: 0,
    recent: [], // last 20 results (see stats.js)
    sessions: [], // last 30 sessions
    errSum: 0, // sum of |tap - target| seconds
    errN: 0,
  }
}

export function loadTimeState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState()
    return normalizeStats({ ...defaultState(), ...JSON.parse(raw) })
  } catch {
    return defaultState()
  }
}

function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // storage unavailable -- fail silently, not critical
  }
}

export function recordTimeGuess(state, correct, sessionId = 0, err = null) {
  const next = {
    ...state,
    streak: correct ? state.streak + 1 : 0,
    bestStreak: correct ? Math.max(state.bestStreak, state.streak + 1) : state.bestStreak,
    totalGuesses: state.totalGuesses + 1,
    totalCorrect: state.totalCorrect + (correct ? 1 : 0),
    errSum: (state.errSum || 0) + (err ?? 0),
    errN: (state.errN || 0) + (err === null ? 0 : 1),
    ...trackResult(state, correct, sessionId, { err }),
  }
  save(next)
  return next
}
