const KEY = 'chess-intuition-progress-v1'
const DEFAULT_RATING = 1200
const K_FACTOR = 24

function defaultState() {
  return {
    rating: DEFAULT_RATING,
    streak: 0,
    bestStreak: 0,
    totalAttempts: 0,
    totalCorrect: 0,
    exposureSeconds: 8,
    colorFilter: 'both', // 'w' | 'b' | 'both'
    history: {}, // puzzleId -> { seen, correct, lastSeenAt, dueAt, intervalMs }
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState()
    return { ...defaultState(), ...JSON.parse(raw) }
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

function expectedScore(playerRating, puzzleRating) {
  return 1 / (1 + Math.pow(10, (puzzleRating - playerRating) / 400))
}

// SM-2-lite: wrong answers come back soon, correct answers come back with
// a growing interval -- simple enough to reason about, no ease-factor tuning.
function nextInterval(prevIntervalMs, correct) {
  if (!correct) return 10 * 60 * 1000 // 10 minutes
  if (!prevIntervalMs) return 24 * 60 * 60 * 1000 // 1 day
  return Math.min(prevIntervalMs * 2.2, 30 * 24 * 60 * 60 * 1000) // cap 30 days
}

export function recordAttempt(state, puzzle, correct) {
  const now = Date.now()
  const expected = expectedScore(state.rating, puzzle.rating)
  const rating = Math.round(state.rating + K_FACTOR * ((correct ? 1 : 0) - expected))

  const prevHist = state.history[puzzle.id] || { seen: 0, correct: 0, intervalMs: 0 }
  const intervalMs = nextInterval(prevHist.intervalMs, correct)
  const history = {
    ...state.history,
    [puzzle.id]: {
      seen: prevHist.seen + 1,
      correct: prevHist.correct + (correct ? 1 : 0),
      lastSeenAt: now,
      dueAt: now + intervalMs,
      intervalMs,
    },
  }

  const next = {
    ...state,
    rating,
    streak: correct ? state.streak + 1 : 0,
    bestStreak: correct ? Math.max(state.bestStreak, state.streak + 1) : state.bestStreak,
    totalAttempts: state.totalAttempts + 1,
    totalCorrect: state.totalCorrect + (correct ? 1 : 0),
    history,
  }
  save(next)
  return next
}

export function setExposureSeconds(state, seconds) {
  const next = { ...state, exposureSeconds: seconds }
  save(next)
  return next
}

export function setColorFilter(state, colorFilter) {
  const next = { ...state, colorFilter }
  save(next)
  return next
}
