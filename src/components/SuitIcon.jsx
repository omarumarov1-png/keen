// Hand-drawn suit pips as inline SVG, so every device renders identical,
// crisp shapes (font glyphs like ♠ vary wildly and some render as emoji).
const PATHS = {
  hearts: (
    <path d="M50 90C21 66 6 49 6 31 6 16 17 6 30 6c9 0 16 5 20 13 4-8 11-13 20-13 13 0 24 10 24 25 0 18-15 35-44 59Z" />
  ),
  diamonds: <path d="M50 3Q67 30 88 50 67 70 50 97 33 70 12 50 33 30 50 3Z" />,
  spades: (
    <path d="M50 4c12 21 42 35 42 56 0 14-11 22-22 22-8 0-14-4-17-10 1 10 5 18 13 22H34c8-4 12-12 13-22-3 6-9 10-17 10-11 0-22-8-22-22C8 39 38 25 50 4Z" />
  ),
  clubs: (
    <>
      <circle cx="50" cy="27" r="18" />
      <circle cx="27" cy="58" r="18" />
      <circle cx="73" cy="58" r="18" />
      <circle cx="50" cy="54" r="10" />
      <path d="M46 56c0 18-4 30-12 38h32c-8-8-12-20-12-38Z" />
    </>
  ),
  joker: <path d="M50 4l13 30 33 3-25 22 8 33-29-17-29 17 8-33L4 37l33-3Z" />,
}

export default function SuitIcon({ suit, className = '', title }) {
  return (
    <svg
      className={`suit-icon ${className}`}
      viewBox="0 0 100 100"
      fill="currentColor"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : 'true'}
      aria-label={title}
    >
      {PATHS[suit] || PATHS.joker}
    </svg>
  )
}
