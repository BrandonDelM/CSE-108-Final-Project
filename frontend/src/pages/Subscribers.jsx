import './Subscribers.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { DataGrid } from '@mui/x-data-grid';
import { apiGetSubscribers, apiPostSubscriber, apiPutSubscriber, apiDeleteSubscriber } from '../api.js'
import Papa from 'papaparse';

function Subscribers({ user, onLogout, onNavigate }) {
    const [rows, setRows] = useState([])
    const [mode, setMode] = useState('login')
    const [email, setEmail] = useState('')
    const [first_name, setFirstName] = useState('')
    const [last_name, setLastName] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

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
            await apiPostSubscriber(user.username, email, first_name, last_name)
            await Set_Subscribers()
            setSuccess('User successfully added')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                console.log("Parsed JSON:", results.data);

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

    useEffect(() => {
        Set_Subscribers()
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
                    getRowId={row => row.id} />

                <input type="file" accept=".csv" onChange={handleFileUpload} />

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
                        <label className="field-label" htmlFor="last">Enter First Name</label>
                        <input
                            id="last"
                            className="field-input"
                            type="text"
                            placeholder="John"
                            value={first_name}
                            onChange={e => setFirstName(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="field-group">
                        <label className="field-label" htmlFor="first">Enter Last Name</label>
                        <input
                            id="first"
                            className="field-input"
                            type="text"
                            placeholder="Doe"
                            value={last_name}
                            onChange={e => setLastName(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    {error && <p className="auth-error">{error}</p>}

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