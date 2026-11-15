// Haptic feedback with two clearly different "feels":
//   success — a crisp, light double tap
//   error   — three heavy, slower pulses (unmistakable even in a pocket)
//
// Android / Chrome: the Web Vibration API (navigator.vibrate) with real
// durations, so error pulses are physically longer and stronger.
//
// iPhone / iPad: Safari never implemented navigator.vibrate (not even in an
// installed PWA). Since iOS 17.4/18, toggling an <input type="checkbox" switch>
// through its <label> plays the system's native switch haptic. We use that as
// a single "tick" and build the two patterns from tick count + rhythm. It's a
// no-op on older iOS, where nothing else is possible from the web.
const canVibrate = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
const isIOS = typeof navigator !== 'undefined' &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))

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

function iosPattern(ticks, gapMs) {
  iosTick()
  for (let i = 1; i < ticks; i++) setTimeout(iosTick, i * gapMs)
}

function vibrate(pattern) {
  try { navigator.vibrate(pattern) } catch { /* unsupported or blocked */ }
}

export function hapticSuccess() {
  if (canVibrate) vibrate([18, 45, 18])
  else if (isIOS) iosPattern(2, 85)
}

export function hapticError() {
  if (canVibrate) vibrate([90, 60, 90, 60, 90])
  else if (isIOS) iosPattern(3, 150)
}
