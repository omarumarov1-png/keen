// Huge, edge-to-edge answer zones for eyes-free play. Each zone is one big
// <button>: tap anywhere inside it. Positions are fixed per layout so they
// can be found by feel:
//   halves: [left | right]               (Black | White, Yes | No)
//   quad:   [top-left  | top-right   ]   (♠ | ♥)
//           [bottom-left | bottom-right] (♣ | ♦)
//   thirds: [left | middle | right]      (stake ×1 | ×2 | ×3)
//   single: one zone filling the area    (time start/stop)
//
// Input uses `click` (with touch-action: manipulation, so no 300ms delay):
// it is the event iOS reliably treats as a user gesture for the switch-haptic
// trick, and it is never fired twice for one touch. Double answers are
// prevented by the caller (a synchronous ref lock + phase check), and while
// `locked` is true every zone ignores input entirely.
//
// `feedback` = { picked, result: 'right' | 'wrong', actual } colours the
// picked zone green/red and outlines the actual answer on a miss.
export default function TapZones({ layout, zones, onPick, locked = false, feedback = null, size = 'tall' }) {
  function stateFor(id) {
    if (!feedback) return 'idle'
    if (id === feedback.picked) return feedback.result
    if (feedback.result === 'wrong' && id === feedback.actual) return 'actual'
    return 'dim'
  }

  return (
    <div className={`tap-zones zones-${layout} zones-${size}${locked ? ' is-locked' : ''}`}>
      {zones.map((z) => {
        const st = stateFor(z.id)
        return (
          <button
            key={z.id}
            type="button"
            className={`tap-zone zone-${z.tone || 'neutral'} state-${st}`}
            data-zone={z.id}
            aria-label={z.aria || z.label}
            aria-disabled={locked || undefined}
            onClick={() => {
              if (!locked) onPick(z.id)
            }}
          >
            <span className="zone-glyph" aria-hidden="true">{z.glyph}</span>
            {z.label && <span className="zone-label">{z.label}</span>}
            {(st === 'right' || st === 'wrong') && (
              <span className="zone-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  {st === 'right' ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />}
                </svg>
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
