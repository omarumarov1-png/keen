// Strong, unmistakable haptics, built so they can be told apart without
// looking at the screen (e.g. training while driving):
//   success: two firm, short pulses ("da-dum")
//   error:   a long, heavy buzz pattern, much longer AND a different rhythm
//   tap:     one tiny tick, only for "input registered" (e.g. a stake pick)
//
// Android / Chrome: the Web Vibration API (navigator.vibrate) with real
// durations.
//
// iPhone / iPad: Safari never implemented navigator.vibrate (not even in an
// installed PWA). Since iOS 17.4/18, toggling an <input type="checkbox" switch>
// through its <label> plays the system's native switch haptic. That is a
// single fixed-strength "tick", so the two feels are built from tick count
// and spacing: success = 2 crisp ticks, error = a rapid burst of 6 ticks that
// reads as a buzz. No-op on older iOS, where nothing else is possible.
//
// Call these synchronously from the tap handler: the first tick/vibration
// then happens inside the user gesture.
export const PATTERNS = {
  android: {
    success: [70, 60, 70],
    error: [280, 110, 280],
    tap: [14],
  },
  ios: {
    success: { ticks: 2, gapMs: 80 },
    error: { ticks: 6, gapMs: 50 },
    tap: { ticks: 1, gapMs: 0 },
  },
}

function canVibrate() {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
}

function isIOS() {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

let pending = []

function cancelPending() {
  for (const id of pending) clearTimeout(id)
  pending = []
}

function iosTick() {
  try {
    const label = document.createElement('label')
    label.ariaHidden = 'true'
    label.style.display = 'none'
    const input = document.createElement('input')
    input.type = 'checkbox'
    input.setAttribute('switch', '')
    label.appendChild(input)
    document.head.appendChild(label)
    label.click()
    document.head.removeChild(label)
  } catch {
    // haptics are a nicety; never let them break a round
  }
}

function play(kind) {
  cancelPending()
  if (canVibrate()) {
    try { navigator.vibrate(PATTERNS.android[kind]) } catch { /* unsupported or blocked */ }
    return
  }
  if (!isIOS()) return
  const { ticks, gapMs } = PATTERNS.ios[kind]
  iosTick() // first tick synchronously, inside the user gesture
  for (let i = 1; i < ticks; i++) pending.push(setTimeout(iosTick, i * gapMs))
}

export function hapticSuccess() {
  play('success')
}

export function hapticError() {
  play('error')
}

export function hapticTap() {
  play('tap')
}
