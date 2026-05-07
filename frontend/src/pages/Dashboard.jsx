import './Dashboard.css'
import { Link } from 'react-router-dom'

export default function Dashboard({ user, onLogout, onNavigate }) {

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
            <div className="stat-value">#</div>
            <div className="stat-label">Emails Sent</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">#</div>
            <div className="stat-label">Emails Created</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">#</div>
            <div className="stat-label">Subscriptions</div>
          </div>
        </div>
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
            <div className="stat-value">Edit campaign settings</div>
            <div className="stat-label">Edit campaign email and password</div>
          </Link>
        </div>
      </main>
    </div>
  )
}