import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Home from './pages/Home.jsx'
import Train from './pages/Train.jsx'
import CardHome from './pages/CardHome.jsx'
import CardTrain from './pages/CardTrain.jsx'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/chess" element={<Home />} />
        <Route path="/chess/train" element={<Train />} />
        <Route path="/cards" element={<CardHome />} />
        <Route path="/cards/train" element={<CardTrain />} />
      </Routes>
    </div>
  )
}

export default App
