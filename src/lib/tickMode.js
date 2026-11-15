// iPhone haptic mode. A web page can make an iPhone tick only when the
// player's finger directly flips a switch -- one tick per tap, and nothing
// played afterwards from code is felt. So right and wrong can't get two
// different vibration patterns on iOS. Instead, only the zones whose answer
// is "right" (or, flipped, "wrong") carry the switch: tick vs no tick.
const KEY = 'keen-tick-on'

export function getTickOn() {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'wrong' ? 'wrong' : 'right'
  } catch {
    return 'right'
  }
}

export function setTickOn(v) {
  try { localStorage.setItem(KEY, v === 'wrong' ? 'wrong' : 'right') } catch { /* private mode */ }
}

// Should the zone with this id tick, given the round's correct answer?
// `answer` null/undefined = unknown (stake picks, time start): always tick.
export function zoneTicks(id, answer, tickOn = getTickOn()) {
  if (answer === null || answer === undefined) return true
  return (id === answer) === (tickOn === 'right')
}
