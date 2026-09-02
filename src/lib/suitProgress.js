const KEY = 'chess-intuition-suits-progress-v1'

function defaultState() {
  return {
    streak: 0,
    bestStreak: 0,
    totalGuesses: 0,
    totalCorrect: 0,
  }
}

export function loadSuitState() {
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

export function recordSuitGuess(state, correct) {
  const next = {
    ...state,
    streak: correct ? state.streak + 1 : 0,
    bestStreak: correct ? Math.max(state.bestStreak, state.streak + 1) : state.bestStreak,
    totalGuesses: state.totalGuesses + 1,
    totalCorrect: state.totalCorrect + (correct ? 1 : 0),
  }
  save(next)
  return next
}

export function resetSuitState() {
  const next = defaultState()
  save(next)
  return next
}
