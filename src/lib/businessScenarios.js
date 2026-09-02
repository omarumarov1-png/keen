// All original, invented scenarios -- no real companies, people, or events.
export const SCENARIOS = [
  { id: 'b1', situation: "A café started charging by how long customers stayed instead of what they ordered.", outcome: "Remote workers loved the fairness of it, and the model spread to several more locations within two years.", result: 'yes' },
  { id: 'b2', situation: "A furniture store began selling chairs specifically designed to be uncomfortable after 20 minutes, to stop people overstaying in waiting rooms.", outcome: "Dentists and DMV offices bought them by the truckload — turnover in waiting rooms improved dramatically.", result: 'yes' },
  { id: 'b3', situation: 'A startup tried selling "silence" as a subscription — a weekly email with literally nothing in it.', outcome: "People unsubscribed within weeks, joking that even nothing wasn't worth the inbox clutter.", result: 'no' },
  { id: 'b4', situation: "A restaurant removed all the prices from its menu and let customers pay whatever they thought was fair.", outcome: "Most people paid far less than the food cost, and the restaurant closed within six months.", result: 'no' },
  { id: 'b5', situation: "A gym opened with mandatory naptime built into every workout class.", outcome: "It became wildly popular with exhausted parents and shift workers, and franchises opened in a dozen cities.", result: 'yes' },
  { id: 'b6', situation: "A company launched a phone app that only worked while you were walking, locking automatically the moment you sat down.", outcome: "Users found it more annoying than motivating, and the app was pulled after a few months.", result: 'no' },
  { id: 'b7', situation: "A bookstore started renting out books instead of selling them, like a library but for-profit.", outcome: "Frequent readers loved not having to store books they'd only read once, and the model turned profitable within a year.", result: 'yes' },
  { id: 'b8', situation: 'A bakery introduced a "mystery flavor" muffin every day, refusing to reveal what was in it until after you bought it.', outcome: "Curiosity kept people coming back daily, and the mystery muffin became the bakery's best-selling item.", result: 'yes' },
  { id: 'b9', situation: 'A moving company offered to pack your entire house without telling you where anything ended up, as a "surprise unpacking experience."', outcome: "Customers hated not being able to find their own belongings, and complaints shut the service down within weeks.", result: 'no' },
  { id: 'b10', situation: "A car wash began offering a soundproof booth where you could yell as loud as you wanted while your car was cleaned.", outcome: "It became a stress-relief novelty that outsold the car wash itself, and the booths were franchised separately.", result: 'yes' },
  { id: 'b11', situation: 'A clothing brand released a line of jackets with the pockets sewn shut, marketed as "distraction-free."', outcome: "Customers found it pointless and returned the jackets in droves, calling it a solution to a problem nobody had.", result: 'no' },
  { id: 'b12', situation: "A coffee shop replaced all its chairs with standing desks only, betting customers would order more if they couldn't linger.", outcome: "Turnover increased, lines moved faster, and the shop's revenue per square foot nearly doubled.", result: 'yes' },
  { id: 'b13', situation: "An ice cream truck started playing silence instead of music, hoping to surprise neighborhoods.", outcome: "Nobody noticed it was coming, sales dropped, and the owner switched the music back on within a week.", result: 'no' },
  { id: 'b14', situation: "A tailor began offering suits with no pockets at all, arguing it created a cleaner silhouette.", outcome: "Customers complained they had nowhere to put their phone or wallet, and the line was discontinued.", result: 'no' },
  { id: 'b15', situation: 'A hotel chain introduced rooms with no mirrors, marketed as a wellness feature for "reducing self-criticism."', outcome: "It became a surprise hit with wellness retreat guests, and the chain expanded the concept to a dozen more locations.", result: 'yes' },
  { id: 'b16', situation: "A parking garage started charging less the longer you stayed, instead of more.", outcome: "People abused the system by parking for days at a time, and the garage lost money until the pricing was reversed.", result: 'no' },
]

const RECENT_WINDOW = 6

export function pickRandom(recentIds) {
  const pool = SCENARIOS.filter((s) => !recentIds.includes(s.id))
  const list = pool.length > 0 ? pool : SCENARIOS
  return list[Math.floor(Math.random() * list.length)]
}

export { RECENT_WINDOW }
