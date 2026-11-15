import SuitIcon from '../components/SuitIcon.jsx'
import Disc from '../components/Disc.jsx'

// Shared rhythm + zone definitions for the eyes-free training screens.

// How long a revealed answer stays on screen before the next round deals
// itself (the flip takes ~0.3s, so the face is readable for ~1s).
export const REVEAL_MS = 1250
// Input stays closed this long after the next card is dealt, while the card
// swings back face-down -- so a tap meant for the previous round can't land
// on the new one.
export const READY_LOCK_MS = 280

// Fixed positions: left = Black, right = White.
export function bwZones(t) {
  return [
    { id: 'black', tone: 'black', glyph: <Disc filled />, label: t('zone.black') },
    { id: 'white', tone: 'white', glyph: <Disc filled />, label: t('zone.white') },
  ]
}

// Fixed 2x2 positions: black suits on the left, red suits on the right.
//   ♠ top-left     ♥ top-right
//   ♣ bottom-left  ♦ bottom-right
export const SUIT_ORDER = ['spades', 'hearts', 'clubs', 'diamonds']
const SUIT_TONE = { spades: 'suit-black', clubs: 'suit-black', hearts: 'suit-red', diamonds: 'suit-red' }

export function suitZones(t) {
  return SUIT_ORDER.map((id) => ({
    id,
    tone: SUIT_TONE[id],
    glyph: <SuitIcon suit={id} />,
    label: t(`suit.${id}`),
  }))
}

// Fixed positions: left = x1, middle = x2, right = x3.
export function stakeZones(t) {
  return [1, 2, 3].map((s) => ({
    id: s,
    tone: `stake-${s}`,
    glyph: <span className="zone-big-text">×{s}</span>,
    label: t(`confidence.stake${s}`),
  }))
}

export function edgeTone(edge) {
  return edge > 0 ? 'good' : edge < 0 ? 'bad' : null
}
