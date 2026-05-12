import './Dashboard.css'
import './Send.css'
import { Link } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
<<<<<<< HEAD
import { apiSend, getCreatedEmails, apiGetSubscribers, getEmailById, apiSendSavedEmail, apiDeleteEmail } from '../api.js'
=======
import { apiSend, getCreatedEmails, apiGetSubscribers, getEmailById } from '../api.js'
>>>>>>> main
import { DataGrid } from '@mui/x-data-grid';
import DOMPurify from 'dompurify'


function Send({ user, onLogout }) {
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
<<<<<<< HEAD

    const [emailError, setEmailError] = useState('')
    const [emailSuccess, setEmailSuccess] = useState('')

=======
>>>>>>> main
    const [emails, setEmails] = useState([])
    const [selected, setSelected] = useState(null)
    const [rows, setRows] = useState([])
    const [selectedRows, setSelectedRows] = useState([])
    const [previewEmail, setPreviewEmail] = useState(null)
    const [loading, setLoading] = useState(false)

    const selectedSubscribers = rows.filter(row => selectedRows.includes(row.id))

    const columns = [
        { field: 'email', headerName: 'Email', width: 300 },
        { field: 'first_name', headerName: 'First Name', width: 300 },
        { field: 'last_name', headerName: 'Last Name', width: 300 },
        { field: 'groups', headerName: 'Groups', width: 200 },
    ];

    async function Set_Subscribers() {
        setError('')
        setLoading(true)
        try {
            const data = await apiGetSubscribers(user.username)
            setRows(data)
        } catch (err) {
            setError('Failed to load subscribers')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        Set_Subscribers()
    }, [])

    async function handleSend() {
        setError(''); setSuccess('')
        if (!selected) { setError('Please select an email to send'); return }
<<<<<<< HEAD
        if (selectedSubscribers.length === 0) { setError('Please select a subscriber to recieve an email'); return }

        setLoading(true)
        const recipients = selectedSubscribers.map(row => row.email)
        try {
            await apiSendSavedEmail(selected, recipients)
            setSuccess(`Email successfully sent to ${selectedRows.length} ${selectedRows.length === 1 ? 'email' : 'emails'}`)
            getEmails()
        } catch (err) {
            setError(err.message)
=======
        if (selectedRows.length === 0) { setError('Please select a subscriber to recieve an email'); return }
        const recipients = selectedRows.map(rowId => {
            const row = rows.find(r => r.id === rowId)
            return row?.email
        }).filter(Boolean)
        try {
            const email = await getEmailById(selected)
            await apiSend(email.header, {
                recipients: recipients,
                subject: email.header,
                body: email.body
            })
            setSuccess(`Email successfully sent to ${selectedRows.length} emails`)
        } catch (err) {
            setError(err.message || 'Failed to send email')
>>>>>>> main
        } finally {
            setLoading(false)
        }
    }

    async function getEmails() {
        try {
            const data = await getCreatedEmails(user.username)
            setEmails(data)
        } catch (err) {
            setError("Couldn't fetch user's emails")
        }
    }

    async function deleteEmail(id) {
        setSuccess('')
        setError('')
        try {
            await apiDeleteEmail(id)
            setEmailSuccess("Successfully deleted email")
            getEmails()
        } catch (err) {
            setEmailError("Couldn't delete email")
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
                        <Link to="/" className="dash-brand-name" disabled={loading}>GoMail</Link>
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

                {emailSuccess && <p className="auth-success">{emailSuccess}</p>}

                {emailError && <p className="auth-success">{emailError}</p>}

                {loading ? <span className="spinner" />
                    : emails.length > 0 ?
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
                                    Email Id: {email.id}<br />
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        type="button"
                                        onClick={e => {
                                            e.stopPropagation()
                                            setPreviewEmail(previewEmail === email.id ? null : email.id)
                                        }}
                                    >
                                        {previewEmail === email.id ? 'Hide Email' : 'Show Email'}
                                    </button>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        type="button"
                                        onClick={e => {
                                            e.stopPropagation()
                                            deleteEmail(email.id)
                                        }}
                                    >
                                        Delete Email
                                    </button>
                                    {previewEmail === email.id && (
                                        <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(email.body) }} />
                                    )}
                                </div>
                            </div>
                        )
                        : <div className="card" style={{ textAlign: 'center', fontSize: '20px' }}>
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

                {rows.length > 0 ? (
                    <DataGrid rows={rows}
                        columns={columns}
                        getRowId={row => row.id}
                        checkboxSelection
                        disableRowSelectionOnClick
                        onRowSelectionModelChange={(ids) => setSelectedRows(ids)}
                    />
                ) : (
                    <div className="card" style={{ textAlign: 'center', fontSize: '16px', padding: '20px' }}>
                        <p>No subscribers found. <Link className="no-email" to="/subscribers">Add subscribers first</Link></p>
                    </div>
                )}

                {success && <p className="auth-success" style={{ color: 'var(--green)' }}>{success}</p>}
                {error && <p className="auth-error">{error}</p>}

                {success && <p className="auth-success">{success}</p>}

                {loading
                    ? <span className="spinner" />
                    : selectedRows.length > 0 && selected && <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={handleSend} disabled={loading}>
                        {selectedRows.length === rows.length ? 'Send to All subscribers' : selectedSubscribers.length === 0 ? 'Select email recievers' : `Send to ${selectedSubscribers.length} subscribers`}
                    </button>}

            </main>
        </div>
    )
}

export default Send
