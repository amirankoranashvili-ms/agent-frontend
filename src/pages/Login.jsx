import { useState } from 'react'
import './Login.css'

const API_BASE = 'https://fastxfood-api-764628510125.us-central1.run.app'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [customer, setCustomer] = useState(null)
  const [error, setError] = useState('')

  async function handleLookup(e) {
    e.preventDefault()
    if (!phone.trim()) return
    setLoading(true)
    setError('')
    setCustomer(null)

    try {
      const res = await fetch(`${API_BASE}/v1/loyalty/lookup?identifier=${encodeURIComponent(phone.trim())}&type=phone`)
      const data = await res.json()
      if (data.found) {
        setCustomer(data)
      } else {
        setError('No loyalty account found with that number.')
      }
    } catch {
      setError('Could not connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        {!customer ? (
          <>
            <div className="login-header">
              <div className="login-icon">X</div>
              <h1>Loyalty Login</h1>
              <p>Enter your phone number to access your account.</p>
            </div>

            <form className="login-form" onSubmit={handleLookup}>
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="text"
                placeholder="555-0101"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                autoFocus
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Looking up...' : 'Sign In'}
              </button>
              {error && <div className="login-error">{error}</div>}
            </form>

            <div className="login-hint">
              <p>Demo accounts: 555-0101 through 555-0110</p>
            </div>
          </>
        ) : (
          <div className="login-profile">
            <div className="profile-avatar">{customer.name[0]}</div>
            <h2>Welcome back, {customer.name}!</h2>
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="stat-value">{customer.points_balance.toLocaleString()}</span>
                <span className="stat-label">Points</span>
              </div>
              <div className="profile-stat">
                <span className="stat-value">{customer.usual_order?.length || 0}</span>
                <span className="stat-label">Usual Items</span>
              </div>
            </div>

            {customer.usual_order && customer.usual_order.length > 0 && (
              <div className="profile-usual">
                <h3>Your Usual</h3>
                {customer.usual_order.map((item, i) => (
                  <div className="usual-item" key={i}>
                    <span className="usual-name">{item.item_name}</span>
                    <span className="usual-detail">
                      {[item.size, ...(item.choices || []), ...(item.modifications || [])].filter(Boolean).join(' · ') || `x${item.quantity}`}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button className="login-signout" onClick={() => { setCustomer(null); setPhone('') }}>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
