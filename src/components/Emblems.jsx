// Custom duotone emblems for each mode. They draw with `currentColor` (the
// mode's hue) plus `--emblem-soft` / `--emblem-bg` set by the surrounding tile.
const SUIT = {
  spades: 'M50 4c12 21 42 35 42 56 0 14-11 22-22 22-8 0-14-4-17-10 1 10 5 18 13 22H34c8-4 12-12 13-22-3 6-9 10-17 10-11 0-22-8-22-22C8 39 38 25 50 4Z',
  hearts: 'M50 90C21 66 6 49 6 31 6 16 17 6 30 6c9 0 16 5 20 13 4-8 11-13 20-13 13 0 24 10 24 25 0 18-15 35-44 59Z',
  diamonds: 'M50 3Q67 30 88 50 67 70 50 97 33 70 12 50 33 30 50 3Z',
}

function Pip({ d, x, y, s, fill }) {
  return (
    <svg x={x} y={y} width={s} height={s} viewBox="0 0 100 100">
      <path d={d} fill={fill} />
    </svg>
  )
}

function Club({ x, y, s, fill }) {
  return (
    <svg x={x} y={y} width={s} height={s} viewBox="0 0 100 100" fill={fill}>
      <circle cx="50" cy="27" r="18" />
      <circle cx="27" cy="58" r="18" />
      <circle cx="73" cy="58" r="18" />
      <circle cx="50" cy="54" r="10" />
      <path d="M46 56c0 18-4 30-12 38h32c-8-8-12-20-12-38Z" />
    </svg>
  )
}

const base = { viewBox: '0 0 64 64', 'aria-hidden': 'true', className: 'emblem' }
const line = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' }

export function CardsEmblem() {
  return (
    <svg {...base}>
      <g transform="rotate(-15 30 40)">
        <rect x="12" y="14" width="25" height="35" rx="4.5" fill="var(--emblem-soft)" {...line} />
      </g>
      <g transform="rotate(9 34 40)">
        <rect x="25" y="12" width="25" height="35" rx="4.5" fill="var(--emblem-bg)" {...line} />
        <Pip d={SUIT.spades} x={30.5} y={21} s={14} fill="currentColor" />
      </g>
    </svg>
  )
}

export function SuitsEmblem() {
  return (
    <svg {...base}>
      <rect x="6" y="6" width="52" height="52" rx="12" fill="var(--emblem-soft)" />
      <path d="M32 10v44M10 32h44" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" />
      <Pip d={SUIT.spades} x={12} y={12} s={15} fill="currentColor" />
      <Pip d={SUIT.hearts} x={37} y={12} s={15} fill="var(--emblem-red)" />
      <Club x={12} y={37} s={15} fill="currentColor" />
      <Pip d={SUIT.diamonds} x={37} y={37} s={15} fill="var(--emblem-red)" />
    </svg>
  )
}

export function ChessEmblem() {
  return (
    <svg {...base}>
      <rect x="8" y="40" width="12" height="12" fill="var(--emblem-soft)" />
      <rect x="44" y="40" width="12" height="12" fill="var(--emblem-soft)" />
      <path d="M30 6h4v4h4v4h-4v4h-4v-4h-4v-4h4z" fill="currentColor" />
      <path d="M21 26c0-5 5-8 11-8s11 3 11 8c0 4-3 7-4 12H25c-1-5-4-8-4-12Z" fill="var(--emblem-bg)" {...line} />
      <path d="M24 38h16l3 12H21z" fill="currentColor" />
      <rect x="17" y="50" width="30" height="7" rx="2.5" fill="currentColor" />
    </svg>
  )
}

export function NumbersEmblem() {
  return (
    <svg {...base}>
      <rect x="9" y="9" width="46" height="46" rx="12" fill="var(--emblem-soft)" {...line} />
      <path d="M22 20h20L29 46" {...line} strokeWidth="5" />
      <circle cx="46" cy="44" r="2.6" fill="currentColor" />
      <circle cx="18" cy="44" r="2.6" fill="currentColor" opacity="0.45" />
    </svg>
  )
}

export function BusinessEmblem() {
  return (
    <svg {...base}>
      <rect x="10" y="40" width="9" height="14" rx="2" fill="var(--emblem-soft)" />
      <rect x="23" y="32" width="9" height="22" rx="2" fill="var(--emblem-soft)" />
      <rect x="36" y="24" width="9" height="30" rx="2" fill="currentColor" opacity="0.45" />
      <path d="M9 33l14-11 9 7 20-17" {...line} strokeWidth="3.2" />
      <path d="M43 11h10v10" {...line} strokeWidth="3.2" />
    </svg>
  )
}

export function TimeEmblem() {
  return (
    <svg {...base}>
      <rect x="27" y="5" width="10" height="6" rx="2" fill="currentColor" />
      <path d="M47 14l4-4" {...line} strokeWidth="3" />
      <circle cx="32" cy="36" r="21" fill="var(--emblem-soft)" {...line} />
      <path d="M32 36V15A21 21 0 0 1 52.2 30.4Z" fill="currentColor" opacity="0.35" />
      <path d="M32 36V22M32 36l9 6" {...line} strokeWidth="3" />
      <circle cx="32" cy="36" r="2.8" fill="currentColor" />
    </svg>
  )
}

function Chip({ x, y }) {
  return (
    <g>
      <rect x={x} y={y} width="15" height="6" rx="3" fill="var(--emblem-bg)" stroke="currentColor" strokeWidth="2" />
      <path d={`M${x + 5} ${y + 1.5}v3M${x + 10} ${y + 1.5}v3`} stroke="currentColor" strokeWidth="1.4" opacity="0.6" />
    </g>
  )
}

export function ConfidenceEmblem() {
  return (
    <svg {...base}>
      <path d="M6 56h52" {...line} opacity="0.5" />
      <Chip x={7} y={47} />
      <Chip x={25} y={47} />
      <Chip x={25} y={39} />
      <Chip x={43} y={47} />
      <Chip x={43} y={39} />
      <Chip x={43} y={31} />
      <path d="M14 30l9-9 8 6 15-15" {...line} strokeWidth="2.6" opacity="0.8" />
      <path d="M40 11h7v7" {...line} strokeWidth="2.6" opacity="0.8" />
    </svg>
  )
}

export function BrandMark({ className = 'brand-mark' }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="km-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1d2333" />
          <stop offset="1" stopColor="#0b0e16" />
        </linearGradient>
        <linearGradient id="km-gold" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f6dc9a" />
          <stop offset="0.55" stopColor="#e2b04f" />
          <stop offset="1" stopColor="#b07f2a" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="96" height="96" rx="26" fill="url(#km-bg)" />
      <rect x="3.5" y="3.5" width="93" height="93" rx="24.5" fill="none" stroke="url(#km-gold)" strokeOpacity="0.55" strokeWidth="1.5" />
      <path d="M33 25v50" stroke="url(#km-gold)" strokeWidth="10" strokeLinecap="round" />
      <path d="M66 25L42 50l24 25" fill="none" stroke="url(#km-gold)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M76 14l2.6 6.4L85 23l-6.4 2.6L76 32l-2.6-6.4L67 23l6.4-2.6Z" fill="#f6dc9a" />
    </svg>
  )
}
