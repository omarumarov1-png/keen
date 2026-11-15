// Small, motion-free data marks shared by the training HUD and the record
// cards: an accuracy ring with a chance marker, a results trail, and a
// per-session bar strip.

// Accuracy ring. `value` in [0,1] or null; `chance` in (0,1) or null (no
// marker). `tone` colours the arc: 'good' | 'bad' | null (mode hue).
export function Ring({ value, chance = null, size = 46, stroke = 4.5, tone = null, label = null, children }) {
  const r = (size - stroke) / 2 - 1.5
  const c = 2 * Math.PI * r
  const mid = size / 2
  const frac = value === null ? 0 : Math.max(0, Math.min(1, value))
  let marker = null
  if (chance !== null) {
    const a = chance * 2 * Math.PI - Math.PI / 2
    const r1 = r - stroke / 2 - 1
    const r2 = r + stroke / 2 + 2.5
    marker = (
      <line
        className="ring-chance"
        x1={mid + r1 * Math.cos(a)}
        y1={mid + r1 * Math.sin(a)}
        x2={mid + r2 * Math.cos(a)}
        y2={mid + r2 * Math.sin(a)}
      />
    )
  }
  return (
    <span className={`ring${tone ? ` tone-${tone}` : ''}`} style={{ width: size, height: size }} role="img" aria-label={label || undefined}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
        <circle className="ring-track" cx={mid} cy={mid} r={r} strokeWidth={stroke} />
        {frac > 0 && (
          <circle
            className="ring-arc"
            cx={mid}
            cy={mid}
            r={r}
            strokeWidth={stroke}
            strokeDasharray={`${c * frac} ${c}`}
            transform={`rotate(-90 ${mid} ${mid})`}
          />
        )}
        {marker}
      </svg>
      <span className="ring-center">{children}</span>
    </span>
  )
}

// Last results as dots, newest on the right. Always `len` slots wide so the
// row never changes length; empty slots are faint rings.
export function Trail({ results, len = 20, label }) {
  const slots = Array.from({ length: len }, (_, i) => {
    const r = results[results.length - len + i]
    return r === undefined ? 'empty' : r ? 'hit' : 'miss'
  })
  return (
    <span className="trail" role="img" aria-label={label}>
      {slots.map((s, i) => <i key={i} className={`trail-dot is-${s}`} />)}
    </span>
  )
}

// Accuracy per session as a bar strip, oldest left. Bars at/above chance use
// the mode hue, below chance are muted; thin sessions (few attempts) are
// drawn lighter so a 3-attempt fluke doesn't shout.
export function SessionBars({ sessions, chance = null, minSlots = 12 }) {
  const W = 300
  const H = 64
  const slots = Math.max(sessions.length, minSlots)
  const step = W / slots
  const bw = Math.max(3, step * 0.62)
  const offset = (slots - sessions.length) * step
  return (
    <svg className="session-bars" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <line className="sb-base" x1="0" x2={W} y1={H - 0.5} y2={H - 0.5} />
      {sessions.map((s, i) => {
        const acc = s.n ? s.c / s.n : 0
        const h = Math.max(2, acc * (H - 4))
        const above = chance === null || acc >= chance
        const weight = Math.min(1, 0.4 + s.n / 25)
        return (
          <rect
            key={s.id}
            className={above ? 'sb-bar' : 'sb-bar is-below'}
            x={offset + i * step + (step - bw) / 2}
            y={H - h}
            width={bw}
            height={h}
            rx={Math.min(2.5, bw / 2)}
            opacity={weight}
          />
        )
      })}
      {chance !== null && (
        <line className="sb-chance" x1="0" x2={W} y1={H - chance * (H - 4)} y2={H - chance * (H - 4)} />
      )}
    </svg>
  )
}
