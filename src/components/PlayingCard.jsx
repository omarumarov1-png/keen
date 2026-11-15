import { motion, useReducedMotion } from 'framer-motion'
import SuitIcon from './SuitIcon.jsx'

// A real 3D flip: the card physically rotates around its Y axis rather than
// swapping content instantly. `card` may be null while face-down (nothing
// to leak before the guess is made) -- but callers also update `card` to
// the *next* card in the same state batch that flips `revealed` back to
// false (so the next round's card is ready once the player guesses again).
// That means the front face's DOM content must never be gated on `card`
// alone: while the return-flip animation is still rotating past the
// visible arc, `card` may already hold the upcoming card's data. Gating
// on `revealed && card` instead means the front face renders nothing the
// instant `revealed` goes false, regardless of what `card` now points to,
// so there's nothing to glimpse mid-rotation.
//
// `result` ('right' | 'wrong' | null) only drives the calm right/wrong glow
// around the card after a reveal; it never affects what the face shows.
// (There is deliberately no shake any more: training screens must stay
// distraction-free for eyes-free play.)
const FACE_RANKS = { J: 'Jack', Q: 'Queen', K: 'King' }

// Switching between the 'up' and 'down' variants replays the same keyframes on
// every flip (reveal and return) without remounting the card.
const LIFT_FRAMES = { y: [0, -14, 0], scale: [1, 1.06, 1], transition: { duration: 0.55, ease: 'easeOut' } }
const LIFT = { up: LIFT_FRAMES, down: LIFT_FRAMES, still: { y: 0, scale: 1 } }
const SHADOW_FRAMES = { scaleX: [1, 0.72, 1], opacity: [0.55, 0.25, 0.55], transition: { duration: 0.55, ease: 'easeInOut' } }
const SHADOW = { up: SHADOW_FRAMES, down: SHADOW_FRAMES, still: { scaleX: 1, opacity: 0.55 } }

function Crown() {
  return (
    <svg className="card-crown" viewBox="0 0 48 28" aria-hidden="true">
      <path d="M4 24 L8 6 L17 16 L24 3 L31 16 L40 6 L44 24 Z" fill="currentColor" opacity="0.9" />
      <rect x="4" y="23" width="40" height="4" rx="1.5" fill="currentColor" />
      <circle cx="8" cy="6" r="2.4" fill="currentColor" />
      <circle cx="24" cy="3" r="2.4" fill="currentColor" />
      <circle cx="40" cy="6" r="2.4" fill="currentColor" />
    </svg>
  )
}

function BackMedallion() {
  return (
    <svg className="card-back-medallion" viewBox="0 0 100 100" aria-hidden="true">
      <g fill="none" stroke="currentColor">
        <circle cx="50" cy="50" r="44" strokeWidth="1.2" opacity="0.55" />
        <circle cx="50" cy="50" r="38" strokeWidth="0.8" opacity="0.4" strokeDasharray="2 3" />
        <path d="M50 8 L58 42 L92 50 L58 58 L50 92 L42 58 L8 50 L42 42 Z" strokeWidth="1.3" opacity="0.8" />
        <path d="M50 20 L55 45 L80 50 L55 55 L50 80 L45 55 L20 50 L45 45 Z" strokeWidth="0.9" opacity="0.55" transform="rotate(45 50 50)" />
      </g>
      <circle cx="50" cy="50" r="17" fill="currentColor" opacity="0.14" />
      <text x="50" y="58" textAnchor="middle" className="card-back-monogram">K</text>
    </svg>
  )
}

export default function PlayingCard({ revealed, card, size = 'normal', colorMode = 'bw', result = null }) {
  const reduce = useReducedMotion()
  const showFace = revealed && card
  const faceClass = showFace ? (colorMode === 'suit' ? `suit-${card.trueColor}` : card.color) : ''
  const isJoker = showFace && card.suit === 'joker'
  const isFace = showFace && FACE_RANKS[card.rank]
  const shown = revealed && result ? result : null

  return (
    <div className={`flip-scene flip-scene-${size}${shown ? ` result-${shown}` : ''}`}>
      <motion.div
        className="flip-shadow"
        aria-hidden="true"
        variants={SHADOW}
        initial={false}
        animate={reduce ? 'still' : revealed ? 'up' : 'down'}
      />
      <motion.div
        className="flip-lift"
        variants={LIFT}
        initial={false}
        animate={reduce ? 'still' : revealed ? 'up' : 'down'}
      >
        <motion.div
          className="flip-inner"
          animate={{ rotateY: revealed ? 180 : 0 }}
          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 24 }}
        >
          <div className="flip-face flip-face-back">
            <div className="card-back-pattern">
              <span className="card-back-frame" aria-hidden="true" />
              <BackMedallion />
              {!revealed && !reduce && <span className="card-back-sheen" aria-hidden="true" />}
            </div>
          </div>
          <div className={`flip-face flip-face-front playing-card-face ${faceClass}`}>
            {showFace && (
              <>
                <span className="card-inner-frame" aria-hidden="true" />
                <span className="card-corner card-corner-tl">
                  <b>{isJoker ? 'J' : card.rank}</b>
                  <SuitIcon suit={card.suit} className="card-corner-pip" />
                </span>
                <motion.span
                  className={`card-center${isJoker ? ' card-center-joker' : ''}`}
                  initial={reduce ? false : { scale: 0.4, opacity: 0, rotate: -12 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.28, type: 'spring', stiffness: 300, damping: 18 }}
                >
                  {isFace && <Crown />}
                  <SuitIcon suit={card.suit} className="card-center-symbol" />
                  {isJoker && <span className="card-joker-word">JOKER</span>}
                  {isFace && <span className="card-face-name">{FACE_RANKS[card.rank]}</span>}
                </motion.span>
                <span className="card-corner card-corner-br">
                  <b>{isJoker ? 'J' : card.rank}</b>
                  <SuitIcon suit={card.suit} className="card-corner-pip" />
                </span>
                {!reduce && <span className="card-face-sheen" aria-hidden="true" />}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
