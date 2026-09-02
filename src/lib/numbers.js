export const DIGIT_MODES = [
  { id: 'd1', digits: 1, min: 0, max: 9 },
  { id: 'd2', digits: 2, min: 10, max: 99 },
  { id: 'd3', digits: 3, min: 100, max: 999 },
  { id: 'd4', digits: 4, min: 1000, max: 9999 },
]

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// One target + 3 distinct distractors, all in the same digit range, shuffled
// into a fixed 4-option round -- pure blind guess, no calculation involved.
export function generateRound(digitModeId) {
  const mode = DIGIT_MODES.find((m) => m.id === digitModeId) || DIGIT_MODES[0]
  const { min, max } = mode
  const target = randomInt(min, max)
  const options = new Set([target])
  while (options.size < 4 && options.size < max - min + 1) {
    options.add(randomInt(min, max))
  }
  return { target, options: shuffle(Array.from(options)) }
}
