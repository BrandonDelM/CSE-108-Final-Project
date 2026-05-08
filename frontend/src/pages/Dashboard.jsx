import './Dashboard.css'
import { React, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiGetSubscribers, apiGetEmails, apiGetSentEmails  } from '../api'

export default function Dashboard({ user, onLogout, onNavigate }) {
  const [subscribers, setSubscribers] = useState(0)
  const [emails, setEmails] = useState(0)
  const [sent, setSent] = useState(0)
  const [error, setError] = useState('')

  async function GetSubscribers() {
    try {
      const subs = await apiGetSubscribers(user.username)
      setSubscribers(subs.length)
    } catch (err) {
      setError("Couldn't fetch total subscribers")
    }
  }

  async function GetEmails() {
    try {
      const emails = await apiGetEmails(user.username)
      setEmails(emails)
    } catch (err) {
      setError("Couldn't fetch total subscribers")
    }
  }

  async function GetSent() {
    try {
      const sent = await apiGetSentEmails(user.username)
      setSent(emails)
    } catch (err) {
      setError("Couldn't fetch total subscribers")
    }
  }

  useEffect(() => {
    GetSubscribers()
    GetEmails()
    GetSent()
  }, [])


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
        <div className="dash-section">
                    <div className="dash-section-head">
                        <h2>Welcome back, {user.username}.</h2>
                    </div>
                </div>
        <div className="stat-row">
          <div className="stat-card">
            <div className="stat-value">{sent}</div>
            <div className="stat-label">Emails Sent</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{emails}</div>
            <div className="stat-label">Emails Created</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{subscribers}</div>
            <div className="stat-label">Subscriptions</div>
          </div>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <div className="stat-row">
          <Link to="/subscribers" className="stat-card card-hover" style={{ textDecoration: 'none' }}>
            <div className="stat-value">Manage Subscriptions</div>
            <div className="stat-label">Add and manage subscribers for your campaign</div>
          </Link>
          <Link to="/mail" className="stat-card card-hover" style={{ textDecoration: 'none' }}>
            <div className="stat-value">Send mail</div>
            <div className="stat-label">Send emails to the subscribers of your campaigns</div>
          </Link>
          <Link to="/settings" className="stat-card card-hover" style={{ textDecoration: 'none' }}>
            <div className="stat-value">Campaign settings</div>
            <div className="stat-label">Edit campaign email and password</div>
          </Link>
        </div>
      </main>
    </div>
  )
}