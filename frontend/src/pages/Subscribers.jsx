import './Subscribers.css'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { DataGrid } from '@mui/x-data-grid';

function Subscribers({ user, onLogout, onNavigate }) {
    const [loading, setLoading] = useState(false)

    const rows = [
        { id: 1, name: 'Data Grid', description: 'the Community version' },
        { id: 2, name: 'Data Grid Pro', description: 'the Pro version' },
        { id: 3, name: 'Data Grid Premium', description: 'the Premium version' },
    ];

    const columns = [
        { field: 'name', headerName: 'Product Name', width: 200 },
        { field: 'description', headerName: 'Description', width: 300 },
    ];

    useEffect(() => {
        async function Set_subscribers() {
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
        Set_subscribers()
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

                <DataGrid rows={rows} columns={columns} />
            </main>
        </div>
    )
}

export default Subscribers;