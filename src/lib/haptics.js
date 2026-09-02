// Web Vibration API -- works on Android Chrome/PWA, silently no-ops where
// unsupported (notably iOS Safari, which doesn't implement it even as an
// installed PWA as of this writing). Always feature-detect before calling.
function vibrate(pattern) {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(pattern)
  }
}

export function hapticSuccess() {
  vibrate(15)
}

export function hapticError() {
  // Noticeably stronger/longer than success -- three heavy pulses, not a
  // brief tick, so a wrong answer is unmistakable even in a pocket.
  vibrate([90, 60, 90, 60, 90])
}
