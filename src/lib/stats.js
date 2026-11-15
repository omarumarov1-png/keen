// Shared attempt/accuracy bookkeeping for every mode's progress store.
//
// Added on top of each store's existing fields (all optional, so data saved by
// older versions loads unchanged -- missing/garbled fields just start empty):
//   recent:   last TRAIL_LEN results, oldest first, 1 = right / 0 = wrong
//   sessions: last SESSIONS_LEN sessions, oldest first:
//             { id, n, c }  (+ e = sum of |error| seconds for time mode,
//                            + p = sum of per-attempt chance for chess)
// A session = one visit to a training screen with at least one attempt; the
// id is the timestamp the screen was opened.

export const TRAIL_LEN = 20
export const SESSIONS_LEN = 30

// Probability of being right by pure guessing, per mode. Chess has no fixed
// value: it is 1 / (number of legal moves) per puzzle, averaged.
export const CHANCE = {
  cards: 0.5,
  suits: 0.25,
  confidence: 0.5,
  numbers: 0.25,
  business: 0.5,
}

export const CHESS_FALLBACK_CHANCE = 1 / 35

export function newSessionId() {
  return Date.now()
}

function validSession(s) {
  return s && typeof s === 'object' && Number.isFinite(s.id) && Number.isFinite(s.n) && Number.isFinite(s.c)
}

// Make whatever was in localStorage safe to read.
export function normalizeStats(state) {
  const recent = Array.isArray(state.recent) ? state.recent.filter((r) => r === 0 || r === 1).slice(-TRAIL_LEN) : []
  const sessions = Array.isArray(state.sessions) ? state.sessions.filter(validSession).slice(-SESSIONS_LEN) : []
  return { ...state, recent, sessions }
}

// Returns the fields to merge into the store's next state.
export function trackResult(state, correct, sessionId, { err = null, chance = null } = {}) {
  const hit = correct ? 1 : 0
  const recent = [...(state.recent || []), hit].slice(-TRAIL_LEN)
  const sessions = [...(state.sessions || [])]
  const last = sessions[sessions.length - 1]
  const cur = last && last.id === sessionId ? { ...last } : { id: sessionId, n: 0, c: 0 }
  cur.n += 1
  cur.c += hit
  if (err !== null) cur.e = (cur.e || 0) + err
  if (chance !== null) cur.p = (cur.p || 0) + chance
  if (last && last.id === sessionId) sessions[sessions.length - 1] = cur
  else sessions.push(cur)
  return { recent, sessions: sessions.slice(-SESSIONS_LEN) }
}

export function currentSession(state, sessionId) {
  const last = state.sessions && state.sessions[state.sessions.length - 1]
  return last && last.id === sessionId ? last : { id: sessionId, n: 0, c: 0 }
}

// accuracy in [0,1] (null with no attempts), edge in percentage points,
// z = how many standard deviations away from pure guessing.
export function summarize(n, c, chance) {
  if (!n) return { n: 0, c: 0, accuracy: null, edge: null, z: null, chance }
  const accuracy = c / n
  let z = null
  if (chance !== null && chance > 0 && chance < 1) {
    z = (c - n * chance) / Math.sqrt(n * chance * (1 - chance))
  }
  const edge = chance !== null ? Math.round(accuracy * 100) - Math.round(chance * 100) : null
  return { n, c, accuracy, edge, z, chance }
}

// "Is this more than luck?" -- a plain-language verdict key for the z-score.
export function verdictKey(n, z) {
  if (!n || z === null) return null
  if (n < 20) return 'verdict.early'
  if (z >= 2) return 'verdict.strong'
  if (z >= 1) return 'verdict.leaning'
  if (z <= -2) return 'verdict.below'
  return 'verdict.luck'
}

export function pct(x) {
  return x === null || x === undefined ? '—' : `${Math.round(x * 100)}%`
}

export function signed(n, unit = '%') {
  if (n === null || n === undefined) return '—'
  return `${n > 0 ? '+' : n < 0 ? '−' : '±'}${Math.abs(n)}${unit}`
}
