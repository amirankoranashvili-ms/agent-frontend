import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import LoginModal from './LoginModal'
import './Navbar.css'

export default function Navbar({ user, onLogin, onLogout }) {
  const { pathname } = useLocation()
  const [showLogin, setShowLogin] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">
            FAST <span>X</span> FOOD
          </Link>

          <div className="navbar-links">
            <Link to="/" className={pathname === '/' ? 'active' : ''}>Home</Link>
            <Link to="/menu" className={pathname === '/menu' ? 'active' : ''}>Menu</Link>
            <Link to="/drive-through" className={pathname === '/drive-through' ? 'active' : ''}>Drive-Through</Link>
            <Link to="/about" className={pathname === '/about' ? 'active' : ''}>About</Link>
            <Link to="/careers" className={pathname === '/careers' ? 'active' : ''}>Careers</Link>
          </div>

          {user ? (
            <div className="navbar-user" ref={dropdownRef}>
              <button className="navbar-avatar" onClick={() => setShowDropdown(!showDropdown)}>
                {user.name[0]}
              </button>
              {showDropdown && (
                <div className="navbar-dropdown">
                  <div className="dropdown-header">
                    <span className="dropdown-name">{user.name}</span>
                    <span className="dropdown-points">{user.points_balance.toLocaleString()} pts</span>
                  </div>
                  <button className="dropdown-logout" onClick={() => { onLogout(); setShowDropdown(false) }}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="navbar-login" onClick={() => setShowLogin(true)}>
              Loyalty Login
            </button>
          )}

          <button
            className={`navbar-hamburger ${mobileOpen ? 'open' : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>

        <div className={`navbar-mobile-menu ${mobileOpen ? 'open' : ''}`}>
          <Link to="/" className={pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/menu" className={pathname === '/menu' ? 'active' : ''}>Menu</Link>
          <Link to="/drive-through" className={pathname === '/drive-through' ? 'active' : ''}>Drive-Through</Link>
          <Link to="/about" className={pathname === '/about' ? 'active' : ''}>About</Link>
          <Link to="/careers" className={pathname === '/careers' ? 'active' : ''}>Careers</Link>
          {!user && (
            <button className="navbar-mobile-login" onClick={() => { setShowLogin(true); setMobileOpen(false) }}>
              Loyalty Login
            </button>
          )}
        </div>
      </nav>

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLogin={(customer) => { onLogin(customer); setShowLogin(false) }}
        />
      )}
    </>
  )
}
