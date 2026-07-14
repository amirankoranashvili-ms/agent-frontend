import { useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ChatSidebar from './components/ChatSidebar'
import Landing from './pages/Landing'
import Menu from './pages/Menu'
import About from './pages/About'
import Careers from './pages/Careers'
import DriveThrough from './pages/DriveThrough'
import './App.css'

function getStoredUser() {
  try {
    const stored = sessionStorage.getItem('fxf_user')
    return stored ? JSON.parse(stored) : null
  } catch { return null }
}

function AppShell({ user, onLogin, onLogout }) {
  const { pathname } = useLocation()
  const isDT = pathname === '/drive-through'

  return (
    <>
      <Navbar user={user} onLogin={onLogin} onLogout={onLogout} />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/about" element={<About />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/drive-through" element={<DriveThrough />} />
        </Routes>
      </main>
      {!isDT && <Footer />}
      {!isDT && <ChatSidebar />}
    </>
  )
}

function App() {
  const [user, setUser] = useState(getStoredUser)

  function handleLogin(customer) {
    sessionStorage.setItem('fxf_user', JSON.stringify(customer))
    setUser(customer)
  }

  function handleLogout() {
    sessionStorage.removeItem('fxf_user')
    setUser(null)
  }

  return (
    <BrowserRouter>
      <AppShell user={user} onLogin={handleLogin} onLogout={handleLogout} />
    </BrowserRouter>
  )
}

export default App
