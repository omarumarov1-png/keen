import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Landing from './pages/Landing.jsx'
import Home from './pages/Home.jsx'
import Train from './pages/Train.jsx'
import CardHome from './pages/CardHome.jsx'
import CardTrain from './pages/CardTrain.jsx'
import SuitTrain from './pages/SuitTrain.jsx'
import NumberHome from './pages/NumberHome.jsx'
import NumberTrain from './pages/NumberTrain.jsx'
import BusinessHome from './pages/BusinessHome.jsx'
import BusinessTrain from './pages/BusinessTrain.jsx'
import TimeHome from './pages/TimeHome.jsx'
import TimeTrain from './pages/TimeTrain.jsx'
import ConfidenceHome from './pages/ConfidenceHome.jsx'
import ConfidenceTrain from './pages/ConfidenceTrain.jsx'
import { useLang } from './lib/i18n.jsx'
import './components/PlayingCard.css'
import './App.css'

const TRAIN_ROUTES = ['/chess/train', '/cards/train', '/cards/suits', '/numbers/train', '/business/train', '/time/train', '/confidence/train']

function isTrainRoute(pathname) {
  return TRAIN_ROUTES.includes(pathname.replace(/\/+$/, ''))
}

// Menus glide in; training screens only cross-fade (no movement while the
// player's hand is already on the answer zones).
function PageWrap({ children, train = false }) {
  const reduce = useReducedMotion()
  const move = !reduce && !train
  return (
    <motion.div
      className={train ? 'page page-train' : 'page'}
      initial={{ opacity: 0, y: move ? 12 : 0 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: move ? -8 : 0 }}
      transition={{ duration: reduce ? 0.01 : 0.24, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  )
}

function LangSwitcher() {
  const { lang, toggleLang } = useLang()
  return (
    <button type="button" className="lang-switcher" onClick={toggleLang} aria-label="Toggle language / Сменить язык">
      <span className={lang === 'en' ? 'on' : ''}>EN</span>
      <span className={lang === 'ru' ? 'on' : ''}>RU</span>
    </button>
  )
}

function App() {
  const location = useLocation()
  const train = isTrainRoute(location.pathname)
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])
  return (
    <div className={`app-shell${train ? ' is-train' : ''}`}>
      {!train && <LangSwitcher />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrap><Landing /></PageWrap>} />
          <Route path="/chess" element={<PageWrap><Home /></PageWrap>} />
          <Route path="/chess/train" element={<PageWrap train><Train /></PageWrap>} />
          <Route path="/cards" element={<PageWrap><CardHome /></PageWrap>} />
          <Route path="/cards/train" element={<PageWrap train><CardTrain /></PageWrap>} />
          <Route path="/cards/suits" element={<PageWrap train><SuitTrain /></PageWrap>} />
          <Route path="/numbers" element={<PageWrap><NumberHome /></PageWrap>} />
          <Route path="/numbers/train" element={<PageWrap train><NumberTrain /></PageWrap>} />
          <Route path="/business" element={<PageWrap><BusinessHome /></PageWrap>} />
          <Route path="/business/train" element={<PageWrap train><BusinessTrain /></PageWrap>} />
          <Route path="/time" element={<PageWrap><TimeHome /></PageWrap>} />
          <Route path="/time/train" element={<PageWrap train><TimeTrain /></PageWrap>} />
          <Route path="/confidence" element={<PageWrap><ConfidenceHome /></PageWrap>} />
          <Route path="/confidence/train" element={<PageWrap train><ConfidenceTrain /></PageWrap>} />
        </Routes>
      </AnimatePresence>
    </div>
  )
}

export default App
