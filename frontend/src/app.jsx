import { useState, useEffect, React } from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { checkSession, apiLogout } from './api.js'
import AuthPage from './pages/AuthPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import SetUp from './pages/SetUp.jsx'
import Subscribers from './pages/Subscribers.jsx'
import SendMail from './pages/Mail.jsx'
import Settings from './pages/Settings.jsx'
import SignUp from './pages/SignUp.jsx'

function SignedInRoutes({ user, onLogout }) {
  const props = { user, onLogout }
  return (
    <Routes>
      <Route path="/" element={<Dashboard {...props} />} />
      <Route path="/subscribers" element={<Subscribers {...props} />} />
      <Route path="/mail" element={<SendMail {...props} />} />
      <Route path="/settings" element={<Settings {...props} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}


export default function App() {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

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

  if (!user) {
    return <AuthPage onLogin={setUser} />
  }
  if (!user.is_setup) {
    return <SetUp user={user} onLogout={handleLogout} onSetupComplete={() => setUser(u => ({ ...u, is_setup: true }))} />
  }



  const props = { user, onLogout: handleLogout }
  return (
    <Routes>
      <Route path="/signup/:campaignId" element={<SignUp />} />
      <Route path="*" element={
        !user ? <AuthPage onLogin={setUser} /> : 
            !user.is_setup ? <SetUp user={user} onLogout={handleLogout} onSetupComplete={() => setUser(u => ({ ...u, is_setup: true }))} />
              : <SignedInRoutes user={user} onLogout={handleLogout} />
      } />
    </Routes>
  )
}