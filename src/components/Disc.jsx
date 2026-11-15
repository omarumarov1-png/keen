// Disc glyph for the Black / White answer zones: it is filled with the
// zone's own colour (black disc on the Black zone, white disc on the White
// zone) and ringed in the contrasting ink, via --disc-fill set in CSS.
export default function Disc({ filled = true }) {
  return (
    <svg className="zone-disc" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" fill={filled ? 'var(--disc-fill, currentColor)' : 'none'} stroke="currentColor" strokeWidth="7" />
    </svg>
  )
}
