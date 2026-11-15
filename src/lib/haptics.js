import { playCue } from './sound.js'

// Strong, unmistakable haptics, built so they can be told apart without
// looking at the screen (e.g. training while driving):
//   success: two crisp pulses ("da-dum")
//   error:   a long, heavy buzz -- much longer AND a different rhythm
//   tap:     one tick, only for "input registered" (stake pick, time start)
//
// Android / Chrome: the Web Vibration API (navigator.vibrate) with real
// durations.
//
// iPhone / iPad: Safari has no navigator.vibrate (not even in an installed
// PWA). The only haptic a web page can produce is the system tick iOS 18+
// plays when an <input type="checkbox" switch> is toggled. So:
//   1. Every answer zone IS a <label> wrapping a real switch (TapZones.jsx).
//      The player's genuine tap toggles it, and iOS plays the first tick
//      natively, from a trusted touch -- nothing programmatic can block it.
//      TapZones calls noteNativeTick() right before handing the answer on.
//   2. The rest of the pattern (1 extra tick for "right", a 5-tick burst for
//      "wrong") is played by click()-ing ONE persistent hidden switch that
//      lives in <body> (inside a label, never display:none). Every follow-up
//      is scheduled with its own setTimeout directly from the tap handler and
//      all of them land well under 1s, which is the window in which WebKit
//      still treats a timer as part of the user gesture.
//   3. If no native tick happened (chess board, keyboard, test hooks), the
//      first tick is also played programmatically, synchronously.
export const PATTERNS = {
  android: {
    success: [70, 60, 70],
    error: [280, 110, 280],
    tap: [14],
  },
  // ticks = total ticks felt, including the native one from the tap itself
  ios: {
    success: { ticks: 2, gapMs: 85 },
    error: { ticks: 6, gapMs: 50 },
    tap: { ticks: 1, gapMs: 0 },
  },
}

// A native tick counts as "the first tick" of a pattern that starts within
// this many ms (same tap handler -- in practice < 5ms).
const NATIVE_WINDOW_MS = 120

function canVibrate() {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
}

export function isIOS() {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

// "iOS 17.5" -> 17.5 ; null when not iOS or unknown.
export function iosVersion(ua = typeof navigator !== 'undefined' ? navigator.userAgent : '') {
  const m = /\bOS (\d+)[_.](\d+)(?:[_.]\d+)? like Mac OS X/.exec(ua)
  if (m) return Number(m[1]) + Number(m[2]) / 10
  // iPadOS "desktop" UA: fall back to the Safari version, which tracks iOS
  const v = /Version\/(\d+)(?:\.(\d+))?.*Safari/.exec(ua)
  if (v && isIOS()) return Number(v[1]) + Number(v[2] || 0) / 10
  return null
}

export function hapticSupport() {
  if (canVibrate()) return { kind: 'vibrate' }
  if (isIOS()) {
    const version = iosVersion()
    return { kind: 'ios', version, ok: version === null || version >= 18 }
  }
  return { kind: 'none' }
}

// ---- the persistent ticker switch -----------------------------------------
let ticker = null

function ensureTicker() {
  if (typeof document === 'undefined' || !document.body) return null
  if (ticker && ticker.isConnected) return ticker
  const label = document.createElement('label')
  label.className = 'haptic-ticker'
  label.setAttribute('aria-hidden', 'true')
  // visually hidden, but rendered (display:none switches don't tick)
  label.style.cssText =
    'position:fixed;left:0;bottom:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;z-index:-1;'
  const input = document.createElement('input')
  input.type = 'checkbox'
  input.setAttribute('switch', '')
  input.tabIndex = -1
  input.style.cssText = 'margin:0;width:1px;height:1px;'
  label.appendChild(input)
  document.body.appendChild(label)
  ticker = label
  return label
}

// create it up-front so the first tap doesn't pay for DOM work
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensureTicker, { once: true })
  else ensureTicker()
}

function iosTick() {
  try {
    const label = ensureTicker()
    if (label) label.click()
  } catch {
    // haptics are a nicety; never let them break a round
  }
}

let nativeTickAt = -Infinity

// Called by a switch-label zone the moment its switch was toggled by a real
// tap (iOS has just played tick #1 natively).
export function noteNativeTick() {
  nativeTickAt = performance.now()
}

let pending = []

function cancelPending() {
  for (const id of pending) clearTimeout(id)
  pending = []
}

function play(kind, { gesture = true } = {}) {
  cancelPending()
  const native = performance.now() - nativeTickAt < NATIVE_WINDOW_MS
  nativeTickAt = -Infinity
  if (gesture && kind !== 'tap') playCue(kind === 'success' ? 'right' : 'wrong')
  if (canVibrate()) {
    try { navigator.vibrate(PATTERNS.android[kind]) } catch { /* unsupported or blocked */ }
    return
  }
  if (!isIOS() || !gesture) return
  const { ticks, gapMs } = PATTERNS.ios[kind]
  // tick #1: already played natively by the tap, or played now (inside the
  // gesture) when the input didn't come through a switch
  if (!native) iosTick()
  for (let i = 1; i < ticks; i++) pending.push(setTimeout(iosTick, i * gapMs))
}

// `gesture: false` = not triggered by a tap (e.g. the chess clock ran out):
// Android still vibrates, iOS ticks and sound cues are skipped.
export function hapticSuccess(opts) {
  play('success', opts)
}

export function hapticError(opts) {
  play('error', opts)
}

export function hapticTap(opts) {
  play('tap', opts)
}
