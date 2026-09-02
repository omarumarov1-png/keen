import { Link } from 'react-router-dom'

const CATEGORIES = [
  {
    to: '/chess',
    icon: '♟',
    label: 'Chess Intuition',
    desc: 'Flash positions from real games — find the best move on instinct, no calculation.',
  },
  {
    to: '/cards',
    icon: '🂠',
    label: 'Card Intuition',
    desc: 'Guess black or white before the card flips — classic intuition/ESP-style training.',
  },
]

export default function Landing() {
  return (
    <div className="landing-page">
      <h1>Intuition Trainer</h1>
      <p className="tagline">Two ways to sharpen instinct over calculation.</p>
      <div className="mode-cards">
        {CATEGORIES.map((c) => (
          <Link key={c.to} to={c.to} className="mode-card">
            <span className="mode-icon">{c.icon}</span>
            <span className="mode-label">{c.label}</span>
            <span className="mode-desc">{c.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
