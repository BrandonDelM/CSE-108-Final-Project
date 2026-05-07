import './Dashboard.css'
import { Link } from 'react-router-dom'
import { useState } from 'react'

function Subscribers({ user, onLogout, onNavigate }) {
    const [loading, setLoading] = useState(false)
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
                <Link to="/" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={loading}>
                    Back
                </Link>
            </main>
        </div>
    )
}

export default Subscribers;