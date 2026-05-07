import { useState } from 'react'
import { apiLogin, apiRegister } from '../api.js'
import './AuthPage.css'

export default function AuthPage({ onLogin }) {
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
    <div className="auth-root">

      {}
      <div className="auth-right">
        <div className="auth-form-wrap fade-in">

          <div className="auth-logo">
            <span className="auth-logo-mark">G</span>
            <span className="auth-logo-text">GoMail</span>
          </div>

          <h1 className="auth-heading">
            {mode === 'login' ? <>A personalized email campaign. <br /></> : <>Create<br /><em>account.</em></>}
          </h1>
          <p className="auth-sub">
            {mode === 'login'
              ? 'Sign in to access your dashboard'
              : 'Register with your university credentials'}
          </p>

          {success && (
            <div className="auth-success fade-in">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="field-group">
              <label className="field-label" htmlFor="username">Username</label>
              <input
                id="username"
                className="field-input"
                type="text"
                autoComplete="username"
                placeholder="e.g. jsmith"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="password">Password</label>
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

            {mode === 'register' && (
              <div className="field-group fade-in">
                <label className="field-label" htmlFor="confirm">Confirm Password</label>
                <input
                  id="confirm"
                  className="field-input"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            {error && <p className="auth-error">{error}</p>}

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading
                ? <span className="spinner" />
                : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="divider">{mode === 'login' ? 'new here?' : 'have an account?'}</div>

          <button
            className="btn btn-ghost btn-full"
            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Create an account' : 'Back to sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}