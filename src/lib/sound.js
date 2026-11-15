// Optional sound cues (default OFF), for when the phone sits in a holder and
// haptics alone are hard to feel:
//   right: two short, soft, rising tones
//   wrong: one low, rounded ~250ms tone
// WebAudio only. iOS only lets an AudioContext start inside a user gesture, so
// the context is created/resumed from tap handlers (playCue is called from
// the answer tap; setSoundOn from the settings toggle) -- never on load.
const KEY = 'keen-sound-v1'

let ctx = null

export function getSoundOn() {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function setSoundOn(on) {
  try {
    localStorage.setItem(KEY, on ? '1' : '0')
  } catch {
    // storage unavailable -- the toggle just won't persist
  }
  if (on) unlockAudio()
}

// Must be called from inside a user gesture.
export function unlockAudio() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    if (!ctx) ctx = new AC()
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function tone(ac, { freq, start, dur, type = 'sine', peak = 0.08, glideTo = null }) {
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, start + dur)
  // soft attack + exponential tail: no clicks, nothing harsh
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  osc.connect(gain).connect(ac.destination)
  osc.start(start)
  osc.stop(start + dur + 0.02)
}

// Called synchronously from the answer tap. No-op unless the setting is on.
export function playCue(kind, { force = false } = {}) {
  if (!force && !getSoundOn()) return
  const ac = unlockAudio()
  if (!ac) return
  try {
    const t0 = ac.currentTime + 0.005
    if (kind === 'right') {
      tone(ac, { freq: 659.25, start: t0, dur: 0.11 }) // E5
      tone(ac, { freq: 987.77, start: t0 + 0.1, dur: 0.16 }) // B5
    } else {
      tone(ac, { freq: 185, start: t0, dur: 0.26, type: 'triangle', peak: 0.12, glideTo: 150 })
    }
  } catch {
    // audio is a nicety
  }
}
