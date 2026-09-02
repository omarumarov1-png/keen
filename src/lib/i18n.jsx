import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const KEY = 'keen-lang-v1'

const dict = {
  en: {
    'landing.tagline': 'Six ways to sharpen instinct over calculation.',
    'landing.chess.label': 'Chess Intuition',
    'landing.chess.desc': 'Flash positions from real games — find the best move on instinct, no calculation.',
    'landing.cards.label': 'Card Intuition',
    'landing.cards.desc': 'Guess black or white before the card flips — classic intuition/ESP-style training.',
    'landing.numbers.label': 'Number Intuition',
    'landing.numbers.desc': 'A number is picked at random — guess it from 4 options before it\'s revealed.',
    'landing.business.label': 'Business Intuition',
    'landing.business.desc': 'Yes or no — did this wild business idea actually work? Guess blind, then read the outcome.',

    'back.keen': '← Keen',
    'back.menu': '← Menu',

    'chess.title': 'Chess Intuition',
    'chess.tagline': 'Flash positions. Trust your first instinct. No calculation, no takebacks — just pattern recognition, sharpened.',
    'stat.rating': 'Rating',
    'stat.bestStreak': 'Best streak',
    'stat.accuracy': 'Accuracy',
    'stat.puzzlesSeen': 'Puzzles seen',
    'chess.mode.white.label': 'Train as White',
    'chess.mode.white.desc': 'Only puzzles where White finds the move',
    'chess.mode.black.label': 'Train as Black',
    'chess.mode.black.desc': 'Only puzzles where Black finds the move',
    'chess.mode.mixed.label': 'Mixed',
    'chess.mode.mixed.desc': 'Both colors, shuffled',
    'chess.exposure': 'Exposure time:',

    'train.loading': 'Loading puzzles…',
    'train.streak': 'Streak:',
    'train.rating': 'Rating:',
    'train.accuracy': 'Accuracy:',
    'train.findMoveFor': 'Find the best move for',
    'train.white': 'White',
    'train.black': 'Black',
    'train.correct': '✓ Correct!',
    'train.incorrect': '✗ Not quite — correct move highlighted',
    'train.timeout': "⏱ Time's up — correct move highlighted",

    'cards.title': 'Card Intuition',
    'cards.tagline': 'A card is drawn face-down. Before it flips, trust your gut.',
    'cards.bw.label': 'Black or White',
    'cards.bw.descPlayed': 'Binary call. {accuracy}% accuracy, best streak {streak}',
    'cards.bw.descUnplayed': 'Binary call. Not played yet',
    'cards.suits.label': 'Guess the Suit',
    'cards.suits.descPlayed': '4-way call — spades, hearts, clubs, diamonds. {accuracy}% accuracy, best streak {streak}',
    'cards.suits.descUnplayed': '4-way call — spades, hearts, clubs, diamonds. Not played yet',

    'cardtrain.shuffling': 'Shuffling…',
    'cardtrain.prompt': 'Is the next card black or white?',
    'cardtrain.correct': '✓ Correct!',
    'cardtrain.incorrect': '✗ Not quite',
    'cardtrain.guessBlack': '⚫ Black',
    'cardtrain.guessWhite': '⚪ White',
    'cardtrain.vsChance': 'vs chance',

    'suittrain.prompt': 'Which suit is next?',
    'suittrain.correct': '✓ Correct!',
    'suittrain.incorrectPrefix': '✗ It was',
    'suit.spades': 'Spades',
    'suit.hearts': 'Hearts',
    'suit.clubs': 'Clubs',
    'suit.diamonds': 'Diamonds',

    'numbers.title': 'Number Intuition',
    'numbers.tagline': 'A random number is picked. Before it\'s revealed, guess it from 4 options — pure gut call, no math.',
    'numbers.mode.d1.label': '1-digit',
    'numbers.mode.d1.desc': '0–9',
    'numbers.mode.d2.label': '2-digit',
    'numbers.mode.d2.desc': '10–99',
    'numbers.mode.d3.label': '3-digit',
    'numbers.mode.d3.desc': '100–999',
    'numbers.mode.d4.label': '4-digit',
    'numbers.mode.d4.desc': '1000–9999',
    'numtrain.prompt': 'Which number is it?',
    'numtrain.correct': '✓ Correct!',
    'numtrain.incorrectPrefix': '✗ It was',

    'business.title': 'Business Intuition',
    'business.tagline': 'A business idea is about to be described. Before you read a word, guess: did it succeed?',
    'biztrain.prompt': 'Yes or no — did it succeed?',
    'biztrain.guessYes': '✓ Yes',
    'biztrain.guessNo': '✗ No',
    'biztrain.correct': '✓ Your gut was right!',
    'biztrain.incorrect': '✗ Your gut was wrong.',
    'biztrain.outcome': 'What happened:',
    'tap.continue': 'Tap to continue →',

    'landing.time.label': 'Time Intuition',
    'landing.time.desc': 'Feel the seconds pass — tap the moment you think the target time has elapsed.',
    'time.title': 'Time Intuition',
    'time.tagline': 'A target time is set. No countdown, no numbers — tap the instant you feel it has passed.',
    'timetrain.start': 'Start',
    'timetrain.tapNow': 'Tap now!',
    'timetrain.target': 'Target:',
    'timetrain.yours': 'Your tap:',
    'timetrain.off': 'Off by:',
    'timetrain.correct': '✓ Great timing!',
    'timetrain.incorrect': '✗ Off target',

    'landing.confidence.label': 'Confidence Stakes',
    'landing.confidence.desc': 'Stake low, medium, or high on your gut feeling before every guess — get rewarded for knowing when you really know.',
    'confidence.title': 'Confidence Stakes',
    'confidence.tagline': 'Before every card, stake how confident you feel. Right and confident scores big — wrong and confident costs big.',
    'confidence.score': 'Score',
    'confidence.stakePrompt': 'How confident do you feel?',
    'confidence.stake1': 'Low',
    'confidence.stake2': 'Medium',
    'confidence.stake3': 'High',
    'confidence.won': '✓ Correct! +{stake} points',
    'confidence.lost': '✗ Wrong. −{stake} points',
  },
  ru: {
    'landing.tagline': 'Шесть способов отточить интуицию вместо расчёта.',
    'landing.chess.label': 'Шахматная интуиция',
    'landing.chess.desc': 'Позиции из реальных партий на короткий показ — найдите лучший ход по наитию, без расчёта.',
    'landing.cards.label': 'Карточная интуиция',
    'landing.cards.desc': 'Угадайте чёрная или белая карта, прежде чем она перевернётся — классическая тренировка интуиции в стиле ESP.',
    'landing.numbers.label': 'Числовая интуиция',
    'landing.numbers.desc': 'Число выбирается случайно — угадайте его из 4 вариантов, прежде чем оно откроется.',
    'landing.business.label': 'Бизнес-интуиция',
    'landing.business.desc': 'Да или нет — сработала ли эта безумная бизнес-идея? Угадайте вслепую, потом прочитайте, что случилось.',

    'back.keen': '← Keen',
    'back.menu': '← Меню',

    'chess.title': 'Шахматная интуиция',
    'chess.tagline': 'Позиция появляется на экране. Доверьтесь первому импульсу. Без расчёта, без отмены хода — только распознавание паттернов.',
    'stat.rating': 'Рейтинг',
    'stat.bestStreak': 'Лучшая серия',
    'stat.accuracy': 'Точность',
    'stat.puzzlesSeen': 'Решено задач',
    'chess.mode.white.label': 'Играть за белых',
    'chess.mode.white.desc': 'Только задачи, где ход находят белые',
    'chess.mode.black.label': 'Играть за чёрных',
    'chess.mode.black.desc': 'Только задачи, где ход находят чёрные',
    'chess.mode.mixed.label': 'Вперемешку',
    'chess.mode.mixed.desc': 'Оба цвета, случайным образом',
    'chess.exposure': 'Время показа:',

    'train.loading': 'Загрузка задач…',
    'train.streak': 'Серия:',
    'train.rating': 'Рейтинг:',
    'train.accuracy': 'Точность:',
    'train.findMoveFor': 'Найдите лучший ход за',
    'train.white': 'белых',
    'train.black': 'чёрных',
    'train.correct': '✓ Верно!',
    'train.incorrect': '✗ Не совсем — верный ход подсвечен',
    'train.timeout': '⏱ Время вышло — верный ход подсвечен',

    'cards.title': 'Карточная интуиция',
    'cards.tagline': 'Карта лежит рубашкой вверх. Прежде чем она перевернётся, доверьтесь чутью.',
    'cards.bw.label': 'Чёрная или белая',
    'cards.bw.descPlayed': 'Бинарный выбор. Точность {accuracy}%, лучшая серия {streak}',
    'cards.bw.descUnplayed': 'Бинарный выбор. Пока не сыграно',
    'cards.suits.label': 'Угадай масть',
    'cards.suits.descPlayed': 'Выбор из 4 — пики, черви, трефы, бубны. Точность {accuracy}%, лучшая серия {streak}',
    'cards.suits.descUnplayed': 'Выбор из 4 — пики, черви, трефы, бубны. Пока не сыграно',

    'cardtrain.shuffling': 'Тасуем колоду…',
    'cardtrain.prompt': 'Следующая карта чёрная или белая?',
    'cardtrain.correct': '✓ Верно!',
    'cardtrain.incorrect': '✗ Не угадали',
    'cardtrain.guessBlack': '⚫ Чёрная',
    'cardtrain.guessWhite': '⚪ Белая',
    'cardtrain.vsChance': 'к случайности',

    'suittrain.prompt': 'Какая масть следующая?',
    'suittrain.correct': '✓ Верно!',
    'suittrain.incorrectPrefix': '✗ Это была',
    'suit.spades': 'Пики',
    'suit.hearts': 'Черви',
    'suit.clubs': 'Трефы',
    'suit.diamonds': 'Бубны',

    'numbers.title': 'Числовая интуиция',
    'numbers.tagline': 'Число выбирается случайно. Прежде чем оно откроется, угадайте его из 4 вариантов — чистое чутьё, без расчёта.',
    'numbers.mode.d1.label': '1 цифра',
    'numbers.mode.d1.desc': '0–9',
    'numbers.mode.d2.label': '2 цифры',
    'numbers.mode.d2.desc': '10–99',
    'numbers.mode.d3.label': '3 цифры',
    'numbers.mode.d3.desc': '100–999',
    'numbers.mode.d4.label': '4 цифры',
    'numbers.mode.d4.desc': '1000–9999',
    'numtrain.prompt': 'Какое это число?',
    'numtrain.correct': '✓ Верно!',
    'numtrain.incorrectPrefix': '✗ Это было',

    'business.title': 'Бизнес-интуиция',
    'business.tagline': 'Сейчас появится описание бизнес-идеи. Прежде чем прочитать хоть слово, угадайте: сработало ли это?',
    'biztrain.prompt': 'Да или нет — сработало ли это?',
    'biztrain.guessYes': '✓ Да',
    'biztrain.guessNo': '✗ Нет',
    'biztrain.correct': '✓ Ваше чутьё не подвело!',
    'biztrain.incorrect': '✗ Чутьё подвело.',
    'biztrain.outcome': 'Что произошло:',
    'tap.continue': 'Нажмите, чтобы продолжить →',

    'landing.time.label': 'Чувство времени',
    'landing.time.desc': 'Почувствуйте, как идут секунды — нажмите в момент, когда, как вам кажется, целевое время прошло.',
    'time.title': 'Чувство времени',
    'time.tagline': 'Задано целевое время. Без обратного отсчёта и цифр — нажмите в тот миг, когда почувствуете, что оно прошло.',
    'timetrain.start': 'Старт',
    'timetrain.tapNow': 'Жми сейчас!',
    'timetrain.target': 'Цель:',
    'timetrain.yours': 'Ваш тап:',
    'timetrain.off': 'Отклонение:',
    'timetrain.correct': '✓ Отличное чувство времени!',
    'timetrain.incorrect': '✗ Мимо цели',

    'landing.confidence.label': 'Ставки на уверенность',
    'landing.confidence.desc': 'Ставьте низко, средне или высоко на своё чутьё перед каждой догадкой — награда за то, что вы действительно знаете, когда знаете.',
    'confidence.title': 'Ставки на уверенность',
    'confidence.tagline': 'Перед каждой картой поставьте на то, насколько вы уверены. Угадали и были уверены — крупный выигрыш. Ошиблись и были уверены — крупный проигрыш.',
    'confidence.score': 'Очки',
    'confidence.stakePrompt': 'Насколько вы уверены?',
    'confidence.stake1': 'Низко',
    'confidence.stake2': 'Средне',
    'confidence.stake3': 'Высоко',
    'confidence.won': '✓ Верно! +{stake} очк.',
    'confidence.lost': '✗ Неверно. −{stake} очк.',
  },
}

const suitRuGenitive = {
  spades: 'пика',
  hearts: 'черва',
  clubs: 'трефа',
  diamonds: 'бубна',
}

// Genitive-ish forms read more naturally after "Это была/It was" -- English
// doesn't inflect, but Russian does; kept as a small lookup rather than
// baked into the dict since it's keyed by suit id, not a flat string.
export function suitNameForFeedback(lang, suitId) {
  if (lang === 'ru') return suitRuGenitive[suitId] || suitId
  return { spades: 'spades', hearts: 'hearts', clubs: 'clubs', diamonds: 'diamonds' }[suitId] || suitId
}

const LanguageContext = createContext(null)

function interpolate(str, vars) {
  if (!vars) return str
  return str.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`))
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem(KEY) || 'en'
    } catch {
      return 'en'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(KEY, lang)
    } catch {
      // storage unavailable -- fail silently, not critical
    }
  }, [lang])

  const setLang = useCallback((l) => setLangState(l), [])
  const toggleLang = useCallback(() => setLangState((l) => (l === 'en' ? 'ru' : 'en')), [])

  const t = useCallback(
    (key, vars) => interpolate((dict[lang] && dict[lang][key]) || dict.en[key] || key, vars),
    [lang]
  )

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}
