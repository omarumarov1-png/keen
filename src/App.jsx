import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Landing from './pages/Landing.jsx'
import Home from './pages/Home.jsx'
import Train from './pages/Train.jsx'
import CardHome from './pages/CardHome.jsx'
import CardTrain from './pages/CardTrain.jsx'
import SuitTrain from './pages/SuitTrain.jsx'
import './App.css'

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

function PageWrap({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

function App() {
  const location = useLocation()
  return (
    <div className="app-shell">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrap><Landing /></PageWrap>} />
          <Route path="/chess" element={<PageWrap><Home /></PageWrap>} />
          <Route path="/chess/train" element={<PageWrap><Train /></PageWrap>} />
          <Route path="/cards" element={<PageWrap><CardHome /></PageWrap>} />
          <Route path="/cards/train" element={<PageWrap><CardTrain /></PageWrap>} />
          <Route path="/cards/suits" element={<PageWrap><SuitTrain /></PageWrap>} />
        </Routes>
      </AnimatePresence>
    </div>
  )
}

export default App
