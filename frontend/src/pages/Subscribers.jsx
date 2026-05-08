import './Subscribers.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { DataGrid } from '@mui/x-data-grid';
import { apiGetSubscribers, apiPostSubscriber, apiPutSubscriber, apiDeleteSubscriber, apiGetCampaignId } from '../api.js'
import Papa from 'papaparse';

function Subscribers({ user, onLogout }) {
    const [rows, setRows] = useState([])
    const [mode, setMode] = useState('login')
    const [email, setEmail] = useState('')
    const [first_name, setFirstName] = useState('')
    const [last_name, setLastName] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)
    const [campaignId, setCampaignId] = useState('')

    const columns = [
        { field: 'email', headerName: 'Email', width: 500, editable: true },
        { field: 'first_name', headerName: 'First Name', width: 300, editable: true },
        { field: 'last_name', headerName: 'Last Name', width: 300, editable: true },
    ];

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError(''); setSuccess('')
        if (!email.trim() || !first_name || !last_name) { setError('All fields are required.'); return }

        if (!isValidEmail(email)) {
            setError('Please enter a valid Email Address')
            return
        }

        setLoading(true)
        try {
            await apiPostSubscriber({
                "username": user.username,
                "email": email,
                "first_name": first_name,
                "last_name": last_name
            })
            await Set_Subscribers()
            setSuccess('User successfully added')
            setEmail('')
            setFirstName('')
            setLastName('')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleRowUpdate(newRow, oldRow) {
        try {
            await apiPutSubscriber(newRow)
            await Set_Subscribers()
            return newRow
        } catch (err) {
            setError(err.message)
            return oldRow  // revert to old values on failure
        }
    }

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: function (header) {
                return header.toLowerCase();
            },
            complete: async function (results) {
                console.log("Parsed JSON:", results.data);
                const subscribers = results.data.map(
                    row => ({
                        username: user.username,
                        email: row.email,
                        first_name: row.first_name,
                        last_name: row.last_name
                    })
                )
                try {
                    await apiPostSubscriber(subscribers)
                    await Set_Subscribers()
                    setSuccess(`Successfully added all subscribers`)
                } catch (err) {
                    setError(err.message)
                }
            },
        });
    };


    async function Set_Subscribers() {
        setError('')
        try {
            const data = await apiGetSubscribers(user.username)
            setRows(data)
        } catch (err) {
            setError('Failed to load subscribers')
        }
    }

    async function SetCampaignId() {
        try {
            const data = await apiGetCampaignId(user.username)
            setCampaignId(data)
        } catch (err) { 
            setError('Failed to get campaign id')
        }
    }

    useEffect(() => {
        Set_Subscribers()
        SetCampaignId()
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
                <Link to="/" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={loading}>
                    Back
                </Link>

                <div className="dash-section">
                    <div className="dash-section-head">
                        <h2>Subscribers</h2>
                    </div>
                </div>

                <DataGrid rows={rows}
                    columns={columns}
                    getRowId={row => row.id}
                    processRowUpdate={handleRowUpdate}
                    onProcessRowUpdateError={err => setError(err.message)}
                    showToolbar
                />

                <div className="field-group">
                    <label className="field-label">Signup Page</label>
                    <input
                        className="field-input"
                        type="text"
                        readOnly
                        value={`${window.location.origin}/signup/${campaignId}`}
                        onClick={e => e.target.select()}
                    />
                </div>

                <div className="dash-section">
                    <div className="dash-section-head">
                        <h2>Add to Mailing List</h2>
                    </div>
                </div>

                <label className="btn btn-ghost btn-sm" title="Format: email,first_name,last_name" style={{ cursor: 'pointer' }}>Upload CSV File
                    <input id="file-upload" type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileUpload} />
                </label>

                <div className="dash-section">
                    <div className="dash-section-head">
                        <h2>Add a Subscriber</h2>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    <div className="field-group">
                        <label className="field-label" htmlFor="email">Enter Email</label>
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
                        <label className="field-label" htmlFor="first">Enter First Name</label>
                        <input
                            id="first"
                            className="field-input"
                            type="text"
                            placeholder="John"
                            value={first_name}
                            onChange={e => setFirstName(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="field-group">
                        <label className="field-label" htmlFor="last">Enter Last Name</label>
                        <input
                            id="last"
                            className="field-input"
                            type="text"
                            placeholder="Doe"
                            value={last_name}
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
                            : 'Add Subscriber'}
                    </button>
                </form>
            </main>
        </div>
    )
}

export default Subscribers;