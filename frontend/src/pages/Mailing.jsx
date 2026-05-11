import './Dashboard.css'
import { Link } from 'react-router-dom'
import { useState, useRef } from 'react'
import { apiSend } from '../api.js'

function Mailing({ user, onLogout }) {
    return (
        <div className="dash-root">
            <header className="dash-header">
                <div className="container dash-header-inner">
                    <div className="dash-brand">
                        <span className="dash-brand-mark">G</span>
                        <Link to="/" className="dash-brand-name">GoMail</Link>
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
                </div>

                <div className="dash-section-label">
                    Mailing Dashboard
                </div>
                
                <div className="stat-row" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <Link to="/mail" className="stat-card card-hover" style={{ textDecoration: 'none' }}>
                    <div className="stat-value">Create Email</div>
                    <div className="stat-label">Create a new email!</div>
                    </Link>
                    <Link to="/send" className="stat-card card-hover" style={{ textDecoration: 'none' }}>
                    <div className="stat-value">Send Email</div>
                    <div className="stat-label">Send emails you've created</div>
                    </Link>
                </div>
            </main>
        </div>
    )
}

export default Mailing