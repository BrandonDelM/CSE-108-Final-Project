import './Dashboard.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { apiLogin, apiGetCredentials, apiPostCredentials, apiRegister, apiPutCredentials } from '../api.js'

function Settings({ user, onLogout, onNavigate }) {

    const [mode, setMode] = useState('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)


    function reset() {
        setEmail(''); setPassword(''); setConfirm(''); setError(''); setSuccess('')
    }

    function switchMode(m) { setMode(m); reset() }

    async function handleSubmit(e) {
        e.preventDefault()
        setError(''); setSuccess('')
        if (!email.trim() || !password) { setError('All fields are required or must be kept as is.'); return }

        setLoading(true)
        try {
            await apiPutCredentials(user.username, email, password)
            setSuccess('Credentials have successfully been changed')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        async function Set_Credentials() {
            try {
                const data = await apiGetCredentials(user.username)
                setEmail(data.email)
                setPassword(data.password)
            } catch (err) {
                setEmail('')
                setPassword('')
                setError('Failed to load credentials')
            }
        }
        Set_Credentials()
    }, [])

    return (
        <div className="dash-root">
            <header className="dash-header">
                <div className="container dash-header-inner">
                    <div className="dash-brand">
                        <span className="dash-brand-mark">G</span>
                        <Link to="/" className="dash-brand-name" disabled={loading}>GoMail</Link>
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
                <div className="dash-welcome">
                    <p className="dash-greeting">Settings</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    <div className="field-group">
                        <label className="field-label" htmlFor="email">Change Campaign Email</label>
                        <input
                            id="email"
                            className="field-input"
                            type="text"
                            autoComplete="email"
                            placeholder="john.doe@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="field-group">
                        <label className="field-label" htmlFor="password">Change Campaign Email Password</label>
                        <div style={{display: 'flex', gap: '10px'}}>
                            <input
                                id="password"
                                className="field-input"
                                type={showPassword ? 'test' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                disabled={loading}
                            />
                            <label className="field-label" htmlFor="visibility">Show Password</label>
                            <input
                                id="visibility"
                                className="field-checkbox"
                                type="checkbox"
                                onClick={() => setShowPassword(prev => !prev)}
                            />
                        </div>
                    </div>

                    {error && <p className="auth-error">{error}</p>}

                    {success && <p className="auth-success">{success}</p>}

                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={loading}
                    >
                        {loading
                            ? <span className="spinner" />
                            : 'Change Credentials'}
                    </button>
                </form>
            </main>
        </div>
    )
}

export default Settings;