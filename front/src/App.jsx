import './App.css'
import { useState } from 'react'
import Home from './Home'
import Times from './Times'
import Partidas from './Partidas'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  return (
    <>
      {currentPage === 'home' && <Home onNavigate={setCurrentPage} />}
      {currentPage === 'times' && <Times onNavigate={setCurrentPage} />}
      {currentPage === 'partidas' && <Partidas onNavigate={setCurrentPage} />}
    </>
  )
}

export default App
