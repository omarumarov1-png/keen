import confetti from 'canvas-confetti'

export function burstSmall() {
  confetti({
    particleCount: 26,
    spread: 55,
    startVelocity: 32,
    origin: { y: 0.65 },
    scalar: 0.8,
    ticks: 90,
  })
}

export function burstCelebration() {
  confetti({
    particleCount: 90,
    spread: 80,
    startVelocity: 45,
    origin: { y: 0.6 },
    ticks: 140,
  })
  setTimeout(() => {
    confetti({ particleCount: 50, spread: 100, origin: { y: 0.6 }, ticks: 120 })
  }, 150)
}
