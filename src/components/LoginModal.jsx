import { useState } from 'react'
import './LoginModal.css'

const API_BASE = 'https://fastxfood-api-764628510125.us-central1.run.app'

export default function LoginModal({ onClose, onLogin }) {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!phone.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API_BASE}/v1/loyalty/lookup?identifier=${encodeURIComponent(phone.trim())}&type=phone`)
      const data = await res.json()
      if (data.found) {
        onLogin(data)
        onClose()
      } else {
        setError('No account found with that number.')
      }
    } catch {
      setError('Could not connect. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="login-modal">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <div className="login-modal-icon">X</div>
        <h2>Loyalty Login</h2>
        <p>Enter your phone number to sign in.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="555-0101"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            autoFocus
          />
          <button type="submit" className="login-modal-btn" disabled={loading}>
            {loading ? 'Looking up...' : 'Sign In'}
          </button>
          {error && <div className="login-modal-error">{error}</div>}
        </form>

        <div className="login-modal-hint">Demo accounts: 555-0101 through 555-0110</div>
      </div>
    </>
  )
}
