import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Train from './pages/Train.jsx'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/train" element={<Train />} />
      </Routes>
    </div>
  )
}

export default App
