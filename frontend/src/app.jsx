import { useState, useEffect } from 'react'
import { checkSession, apiLogout } from './api.js'
import AuthPage from './pages/AuthPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import SetUp from './pages/SetUp.jsx'

export default function App() {
  const [user, setUser]       = useState(null)
  const [ready, setReady]     = useState(false)

  useEffect(() => {
    checkSession().then(data => {
      if (data) setUser(data)
      setReady(true)
    })
  }, [])

  async function handleLogout() {
    await apiLogout()
    setUser(null)
  }

  if (!ready) return (
    <div style={{
      minHeight: '100svh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--ink)',
    }}>
      <span className="spinner" style={{
        borderColor: 'rgba(232,160,48,0.2)',
        borderTopColor: 'var(--amber)',
        width: 28, height: 28, borderWidth: 3,
      }} />
    </div>
  )

  if (!user) return <AuthPage onLogin={setUser} />

  return <SetUp user={user} onLogout={handleLogout} />
}