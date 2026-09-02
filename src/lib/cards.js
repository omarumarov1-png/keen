export const SUITS = [
  { id: 'spades', symbol: '♠', color: 'black', trueColor: 'black', label: 'Spades' },
  { id: 'clubs', symbol: '♣', color: 'black', trueColor: 'black', label: 'Clubs' },
  { id: 'hearts', symbol: '♥', color: 'white', trueColor: 'red', label: 'Hearts' },
  { id: 'diamonds', symbol: '♦', color: 'white', trueColor: 'red', label: 'Diamonds' },
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
        color: suit.color, // 'black' | 'white' -- the black/white-mode guessing target
        trueColor: suit.trueColor, // 'black' | 'red' -- real suit color, for the suit-guessing mode
      })
    }
  }
  if (includeJokers) {
    deck.push({ id: 'joker-black', rank: 'Joker', suit: 'joker', symbol: '★', color: 'black', trueColor: 'black' })
    deck.push({ id: 'joker-white', rank: 'Joker', suit: 'joker', symbol: '★', color: 'white', trueColor: 'red' })
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
