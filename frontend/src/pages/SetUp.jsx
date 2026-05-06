import './Dashboard.css'
import { useState } from 'react'
import { apiLogin, apiRegister } from '../api.js'

export default function Dashboard({ user, onLogout }) {
      const [mode, setMode]       = useState('login')
      const [username, setUsername] = useState('')
      const [password, setPassword] = useState('')
      const [confirm, setConfirm]   = useState('')
      const [error, setError]       = useState('')
      const [success, setSuccess]   = useState('')
      const [loading, setLoading]   = useState(false)
    
      function reset() {
        setUsername(''); setPassword(''); setConfirm(''); setError(''); setSuccess('')
      }
    
      function switchMode(m) { setMode(m); reset() }
    
      async function handleSubmit(e) {
        e.preventDefault()
        setError(''); setSuccess('')
        if (!username.trim() || !password) { setError('All fields are required.'); return }
    
        if (mode === 'register') {
          if (password !== confirm) { setError('Passwords do not match.'); return }
          if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
        }
    
        setLoading(true)
        try {
          if (mode === 'login') {
            const user = await apiLogin(username.trim(), password)
            if (user) { onLogin(user) }
            else { setError('Invalid username or password.') }
          } else {
            await apiRegister(username.trim(), password)
            setSuccess('Account created! You can now sign in.')
            switchMode('login')
            setUsername(username.trim())
          }
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
              <label className="field-label" htmlFor="email">Entet Your Campaign Email</label>
              <input
                id="email"
                className="field-input"
                type="text"
                autoComplete="email"
                placeholder="john.doe@example.com"
                value={username}
                onChange={e => setUsername(e.target.value)}
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