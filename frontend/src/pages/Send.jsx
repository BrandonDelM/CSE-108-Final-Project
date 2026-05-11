import './Dashboard.css'
import { Link } from 'react-router-dom'
import { useState, useRef } from 'react'
import { apiSend } from '../api.js'


function Send({ user, onLogout }) {

    async function handleSend() {
        return
    }

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
                    <Link to="/" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Back</Link>
                    <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={handleSend}>Send</button>
                </div>

                <div className="dash-section-label">
                    Created Emails
                </div>

                
            </main>
        </div>
    )
}

export default Send