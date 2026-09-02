import { Chess } from 'chess.js'

const BASE = import.meta.env.BASE_URL

let cache = null

export async function loadPuzzles() {
  if (cache) return cache
  const res = await fetch(`${BASE}data/puzzles.json`)
  if (!res.ok) throw new Error(`Failed to load puzzles: ${res.status}`)
  cache = await res.json()
  return cache
}

// A puzzle's FEN is the position BEFORE the opponent's setup move. Apply it
// to get the actual position the player must react to, plus a Chess
// instance pre-loaded there for legal-move/validity checks.
export function preparePuzzle(puzzle) {
  const chess = new Chess(puzzle.fen)
  chess.move({
    from: puzzle.setup.slice(0, 2),
    to: puzzle.setup.slice(2, 4),
    promotion: puzzle.setup.length > 4 ? puzzle.setup[4] : undefined,
  })
  return {
    ...puzzle,
    positionFen: chess.fen(),
    turn: chess.turn(), // 'w' | 'b' -- whose move the player must find
    chess,
  }
}

// Weighted pick: prefer puzzles near the player's current rating (matches
// the "flash cards you can *almost* solve" difficulty sweet spot used by
// adaptive spaced-repetition trainers), and prefer ones not recently shown.
export function pickNextPuzzle(puzzles, playerRating, history, recentIds) {
  const now = Date.now()
  const candidates = puzzles.filter((p) => !recentIds.includes(p.id))
  const pool = candidates.length > 0 ? candidates : puzzles

  // Any puzzle explicitly due for spaced-repetition review takes priority.
  const due = pool.filter((p) => {
    const h = history[p.id]
    return h && h.dueAt && h.dueAt <= now
  })
  if (due.length > 0) {
    return due[Math.floor(Math.random() * due.length)]
  }

  // Otherwise weight by closeness to current rating (gaussian-ish falloff).
  const weighted = pool.map((p) => {
    const diff = p.rating - playerRating
    const weight = Math.exp(-(diff * diff) / (2 * 180 * 180))
    return { p, weight }
  })
  const total = weighted.reduce((s, w) => s + w.weight, 0)
  let r = Math.random() * total
  for (const { p, weight } of weighted) {
    r -= weight
    if (r <= 0) return p
  }
  return pool[pool.length - 1]
}
