import './Dashboard.css'
import { useState } from 'react'
import { apiLogin, apiPostCredentials, apiRegister } from '../api.js'

export default function Dashboard({ user, onLogout, onSetupComplete }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  function reset() {
    setEmail(''); setPassword(''); setConfirm(''); setError(''); setSuccess('')
  }

  function switchMode(m) { setMode(m); reset() }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!email.trim() || !password) { setError('All fields are required.'); return }

    if (!isValidEmail(email)) {
      setError('Please enter a valid Email Address')
      return
    }

    setLoading(true)
    try {
      await apiPostCredentials(user.username, email, password)
      onSetupComplete()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dash-root">
      <header className="dash-header">
        <div className="container dash-header-inner">
          <div className="dash-brand">
            <span className="dash-brand-mark">G</span>
            <span className="dash-brand-name">GoMail</span>
          </div>
          <div className="dash-header-right">
            <span className="dash-username">{user.username}</span>
            <button className="btn btn-ghost btn-sm" onClick={onLogout}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="dash-main container fade-in">
        <div className="dash-welcome">
          <p className="dash-greeting">Let us get you set up first:</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="field-group">
            <label className="field-label" htmlFor="email">Enter Your Campaign Email</label>
            <input
              id="email"
              className="field-input"
              type="text"
              autoComplete="email"
              placeholder="john.doe@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="password">Enter Your Campaign Email Password</label>
            <input
              id="password"
              className="field-input"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading
              ? <span className="spinner" />
              : 'Submit'}
          </button>
        </form>
      </main>
    </div>
  )
}