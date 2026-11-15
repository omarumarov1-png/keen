import { useCallback, useLayoutEffect, useRef } from 'react'
import { flushSync } from 'react-dom'
import { noteNativeTick } from '../lib/haptics.js'

// The hidden switch inside a zone. The answer is taken from the NATIVE
// `change` event, which fires only after the toggle has fully happened (so
// iOS has played its tick). React's checkbox onChange runs earlier, during
// the click: re-rendering there could detach the switch mid-toggle when the
// answer swaps the zones (stake -> colour, yes/no -> reveal).
function ZoneSwitch({ label, disabled, onToggle }) {
  const cb = useRef(onToggle)
  useLayoutEffect(() => {
    cb.current = onToggle
  })
  const ref = useCallback((el) => {
    if (!el) return undefined
    const h = () => cb.current()
    el.addEventListener('change', h)
    return () => el.removeEventListener('change', h)
  }, [])
  return <input ref={ref} type="checkbox" switch="" className="zone-switch" aria-label={label} disabled={disabled} />
}

// Huge, edge-to-edge answer zones for eyes-free play. Positions are fixed per
// layout so they can be found by feel:
//   halves: [left | right]               (Black | White, Yes | No)
//   quad:   [top-left  | top-right   ]   (♠ | ♥)
//           [bottom-left | bottom-right] (♣ | ♦)
//   thirds: [left | middle | right]      (stake ×1 | ×2 | ×3)
//   single: one zone filling the area    (time start/stop)
//
// iPhone haptics: each zone is a <label> wrapping a real, visually hidden
// <input type="checkbox" switch>. Tapping anywhere in the label toggles the
// switch, and iOS 18+ plays its native switch tick for that toggle -- from
// the genuine touch, so it can't be swallowed like a programmatic click.
//
// One answer per tap: the answer is taken ONLY from the input's native change
// event (the label's own click and the synthetic click it forwards to the
// input are ignored), and the page's synchronous ref lock rejects anything that slips
// through. While `locked`, the switches are disabled: a tap during the reveal
// / ready lock toggles nothing, so it gives NO tick -- the absence of a tick
// honestly says "that tap didn't count".
//
// `feedback` = { picked, result: 'right' | 'wrong', actual } colours the
// picked zone green/red and outlines the actual answer on a miss.
export default function TapZones({ layout, zones, onPick, locked = false, feedback = null, size = 'tall', className = '' }) {
  function stateFor(id) {
    if (!feedback) return 'idle'
    if (id === feedback.picked) return feedback.result
    if (feedback.result === 'wrong' && id === feedback.actual) return 'actual'
    return 'dim'
  }

  return (
    <div className={`tap-zones zones-${layout} zones-${size}${locked ? ' is-locked' : ''} ${className}`}>
      {zones.map((z) => {
        const st = stateFor(z.id)
        return (
          <label
            key={z.id}
            className={`tap-zone zone-${z.tone || 'neutral'} state-${st}`}
            data-zone={z.id}
          >
            <ZoneSwitch
              label={z.aria || z.label}
              disabled={locked}
              onToggle={() => {
                if (locked) return
                noteNativeTick()
                // render the lock synchronously: the switches are disabled
                // before any further tap can reach them
                flushSync(() => onPick(z.id))
              }}
            />
            <span className="zone-glyph" aria-hidden="true">{z.glyph}</span>
            {z.label && <span className="zone-label" aria-hidden="true">{z.label}</span>}
            {(st === 'right' || st === 'wrong') && (
              <span className="zone-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  {st === 'right' ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />}
                </svg>
              </span>
            )}
          </label>
        )
      })}
    </div>
  )
}
