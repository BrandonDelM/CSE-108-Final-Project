import './Dashboard.css'
import './Send.css'
import { Link } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { apiSend, getCreatedEmails, apiGetSubscribers } from '../api.js'
import { DataGrid } from '@mui/x-data-grid';


function Send({ user, onLogout }) {
    const [error, setError] = useState('')
    const [emails, setEmails] = useState([])
    const [selected, setSelected] = useState(null)
    const [email, setEmail] = useState('')
    const [rows, setRows] = useState([])
    const [selectedRows, setSelectedRows] = useState([])

    const columns = [
        { field: 'email', headerName: 'Email', width: 300 },
        { field: 'first_name', headerName: 'First Name', width: 300 },
        { field: 'last_name', headerName: 'Last Name', width: 300 },
        { field: 'groups', headerName: 'Groups', width: 200 },
    ];

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

    async function handleSend() {
        setError(''); setSuccess('')
        if (!selected) { setError('Please select an email to send'); return }
        if (selectedSubscribers.length === 0) { setError('Please select a subscriber to recieve an email'); return }
        const recipients = selectedSubscribers.map(row => row.email)
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
                    <Link to="/mailing" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Back</Link>
                </div>

                <div className="dash-section">
                    <div className="dash-section-head">
                        <h2>Created Emails</h2>
                    </div>
                </div>

                {emails.length > 0 ?
                    emails.map(email =>
                        <div key={email.id} className="card card-hover-2" style={{
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
                    )
                    : <div className="card" style={{textAlign: 'center', fontSize: '20px'}}>
                        <div>
                            You don't have any emails to send! <Link className="no-email" to="/mail">Create a new email to begin sending</Link>..
                        </div>
                    </div>}

                <div className="dash-section">
                    <div className="dash-section-head">
                        <h2>Email Recipients</h2>
                    </div>
                    <div className="dash-role-text">
                        <p>Select recipients of the email</p>
                    </div>
                </div>

                <DataGrid rows={rows}
                    columns={columns}
                    getRowId={row => row.id}
                    checkboxSelection
                    disableRowSelectionOnClick
                    onRowSelectionModelChange={(ids) => setSelectedRows(ids)}
                />

                {error && <p className="auth-error">{error}</p>}

                <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={handleSend}>Send</button>

            </main>
        </div>
    )
}

export default Send