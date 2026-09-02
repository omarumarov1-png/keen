import { AnimatePresence, motion } from 'framer-motion'

export default function QuoteBanner({ quote }) {
  return (
    <AnimatePresence>
      {quote && (
        <motion.div
          className="quote-banner"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <p className="quote-text">«{quote.text}»</p>
          <p className="quote-author">— {quote.author}</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
