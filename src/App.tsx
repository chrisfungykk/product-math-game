import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomeScreen from './components/HomeScreen'
import GameScreen from './components/GameScreen'
import ResultsScreen from './components/ResultsScreen'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/game" element={<GameScreen />} />
        <Route path="/results" element={<ResultsScreen />} />
      </Routes>
    </Router>
  )
}

export default App
