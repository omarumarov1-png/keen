const SUITS = [
  { id: 'spades', symbol: '♠', color: 'black' },
  { id: 'clubs', symbol: '♣', color: 'black' },
  { id: 'hearts', symbol: '♥', color: 'white' },
  { id: 'diamonds', symbol: '♦', color: 'white' },
]

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

export function buildDeck({ includeJokers = true } = {}) {
  const deck = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${rank}-${suit.id}`,
        rank,
        suit: suit.id,
        symbol: suit.symbol,
        color: suit.color, // 'black' | 'white' -- the guessing target
      })
    }
  }
  if (includeJokers) {
    deck.push({ id: 'joker-black', rank: 'Joker', suit: 'joker', symbol: '★', color: 'black' })
    deck.push({ id: 'joker-white', rank: 'Joker', suit: 'joker', symbol: '★', color: 'white' })
  }
  return deck
}

export function shuffle(deck) {
  const arr = [...deck]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
