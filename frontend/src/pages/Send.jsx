import './Dashboard.css'
import './Send.css'
import { Link } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { apiSend, getCreatedEmails } from '../api.js'


function Send({ user, onLogout }) {
    const [error, setError] = useState('')
    const [emails, setEmails] = useState([])
    const [selected, setSelected] = useState(null)

    async function handleSend() {
        return
    }

    async function getEmails() {
        try {
            const data = await getCreatedEmails(user.username)
            setEmails(data)
        } catch (err) {
            setError("Couldn't fetch user's emails")
        }
    }

    function resetColor() {

    }

    useEffect(() => {
        getEmails()
    }, [])

    return (
        <div className="dash-root">
            <header className="dash-header">
                <div className="container dash-header-inner">
                    <div className="dash-brand">
                        <span className="dash-brand-mark">G</span>
                        <Link to="/mail" className="dash-brand-name">GoMail</Link>
                    </div>
                    <div className="dash-header-right">
                        <span className="dash-username">{user.username}</span>
                        <button className="btn btn-ghost btn-sm" onClick={onLogout}>Sign out</button>
                    </div>
                </div>
            </header>

            <main className="dash-main container fade-in">
                <div>
                    <Link to="/mailing" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Back</Link>
                    <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={handleSend}>Send</button>
                </div>

                <div className="dash-section">
                    <div className="dash-section-head">
                        <h2>Created Emails</h2>
                    </div>
                </div>

                {emails.map(email => 
                <div key={email.id} className="card" style={{
                    cursor: 'pointer',
                    border: selected === email.id
                        ? '1px solid var(--amber)'
                        : '1px solid var(--border)',
                    background: selected === email.id
                        ? 'var(--ink-3)'
                        : 'var(--ink-2)',
                    transition: 'all 0.15s ease',
                    textAlign: 'center'
                }} onClick={() => 
                    setSelected(email.id)
                }>
                    <p className="stat-value">{email.header}</p>
                    <div className="stat-label">
                        Creation Date: {email.date}<br />
                        Email Id: {email.id}
                    </div>
                </div>
                )}

                <div className="dash-section">
                    <div className="dash-section-head">
                        <h2>Email Recipients</h2>
                    </div>
                    <div className="dash-role-text">
                        <p>Select recipients of the email</p>
                    </div>
                </div>
                
                
            </main>
        </div>
    )
}

export default Send