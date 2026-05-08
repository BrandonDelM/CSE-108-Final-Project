import { useParams, useNavigate } from 'react-router-dom'
import { useState, React, useEffect } from 'react'
import './DashBoard.css'
import { apiGetCampaignUsername, apiPostSubscriber } from '../api'

function SignUp() {
    const { campaignId } = useParams()
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')

    const navigate = useNavigate()
    const [valid, setValid] = useState(null)

    useEffect(() => {
        async function checkCampaign() {
            try {
                await apiGetCampaignUsername(campaignId)
                setValid(true)
            } catch (err) {
                navigate('/')
            }
        }
        checkCampaign()
    }, [campaignId])

    async function GetUsername() {
        setUsername('')
        try {
            const data = await apiGetCampaignUsername(campaignId)
            setUsername(data)
        } catch (err) {
            setError("Couldn't fetch campaign username")
        }
    }

    useEffect(() => {
        GetUsername()
    }, [])

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError(''); setSuccess('')
        if (!email.trim() || !firstName || !lastName) { setError('All fields are required.'); return }

        if (!isValidEmail(email)) {
            setError('Please enter a valid Email Address')
            return
        }

        setLoading(true)
        try {
            await apiPostSubscriber({"username": username, "email": email, "first_name": firstName, "last_name": lastName})
            setSuccess("Thank you for subscribing!")
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (valid === null) return (
        <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ink)' }}>
            <span className="spinner" style={{ borderColor: 'rgba(232,160,48,0.2)', borderTopColor: 'var(--amber)', width: 28, height: 28, borderWidth: 3 }} />
        </div>
    )

    return (
        <div className="dash-root">
            <header className="dash-header">
                <div className="container dash-header-inner">
                    <div className="dash-brand">
                        <span className="dash-brand-mark">G</span>
                        <span className="dash-brand-name">GoMail</span>
                    </div>
                </div>
            </header>

            <main className="dash-main container fade-in">
                <div className="dash-welcome">
                    <p className="dash-greeting">Sign up to {username ? `${username}'s` : "this"} emailing list</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    <div className="field-group">
                        <label className="field-label" htmlFor="email">Email</label>
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
                        <label className="field-label" htmlFor="first-name">First Name</label>
                        <input
                            id="first-name"
                            className="field-input"
                            type="text"
                            autoComplete="first-name"
                            placeholder="John"
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="field-group">
                        <label className="field-label" htmlFor="last-name">Last Name</label>
                        <input
                            id="last-name"
                            className="field-input"
                            type="text"
                            autoComplete="last-name"
                            placeholder="Doe"
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                            disabled={loading}
                        />
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
                            : 'Subscribe'}
                    </button>
                </form>
            </main>
        </div>
    )
}

export default SignUp;