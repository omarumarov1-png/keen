import { motion } from 'framer-motion'

// A real 3D flip: the card physically rotates around its Y axis rather than
// swapping content instantly. `card` may be null while face-down (nothing
// to leak before the guess is made).
export default function PlayingCard({ revealed, card, size = 'normal', colorMode = 'bw' }) {
  const faceClass = card ? (colorMode === 'suit' ? `suit-${card.trueColor}` : card.color) : ''
  return (
    <div className={`flip-scene flip-scene-${size}`}>
      <motion.div
        className="flip-inner"
        animate={{ rotateY: revealed ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      >
        <div className="flip-face flip-face-back">
          <div className="card-back-pattern">
            <span className="card-back-mark">?</span>
          </div>
        </div>
        <div className={`flip-face flip-face-front playing-card-face ${faceClass}`}>
          {card && (
            <>
              <span className="card-corner card-corner-tl">
                {card.rank}
                <br />
                {card.symbol}
              </span>
              <motion.span
                className="card-center"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.28, type: 'spring', stiffness: 300, damping: 18 }}
              >
                {card.symbol}
              </motion.span>
              <span className="card-corner card-corner-br">
                {card.rank}
                <br />
                {card.symbol}
              </span>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
