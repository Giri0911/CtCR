import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>College to Campus Recruitment</h1>
      <p>This is a simple platform for connecting college students with campus recruitment and internships opportunities.</p>
    </>
  )
}

export default App
