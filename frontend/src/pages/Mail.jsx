import './Dashboard.css'
import { Link } from 'react-router-dom'
import { useState, useRef } from 'react'
import { apiSend, apiSave } from '../api.js'
import TextEditor from '../TextEditor.jsx'

const PALETTE = [
    { type: 'header', label: 'Header' },
    { type: 'body', label: 'Body Text' },
    { type: 'link', label: 'Link' },
    { type: 'image', label: 'Image' },
]

function ImageField({ onChange }) {
    const fileRef = useRef()
    const [src, setSrc] = useState(null)

    function handleFile(e) {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = ev => {
            setSrc(ev.target.result)
            onChange(ev.target.result)
        }
        reader.readAsDataURL(file)
    }

    return <>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        {src
            ? <img src={src} alt="" style={{ maxWidth: '100%', borderRadius: '6px' }} />
            : <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current.click()}>Add Image</button>
        }
    </>
}

function Mail({ user, onLogout }) {
    const [fields, setFields] = useState([])
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')
    const [subject, setSubject] = useState('')
    const [bgColor, setBgColor] = useState('')

    function updateValue(uid, value) {
        setFields(prev => prev.map(f => f.uid === uid ? { ...f, value } : f))
    }

    async function handleSend() {
        const payload = fields.map(f => ({ type: f.type, value: f.value || '' }))
        const data = await apiSend(subject, payload, bgColor)
        setSuccess(data.msg)
    }

    async function handleSave() {
        setError('')
        setSuccess('')
        try {
            const payload = fields.map(f => ({ type: f.type, value: f.value || '' }))
            const data = await apiSave(subject, payload, bgColor)
            setSuccess(data.msg)
        } catch (err) {
            setError("Couldn't save email to the server")
        }
    }

    function reorder(fromUid, toUid) {
        setFields(prev => {
            const from = prev.findIndex(f => f.uid === fromUid)
            const to = prev.findIndex(f => f.uid === toUid)
            const next = [...prev]
            next.splice(to, 0, next.splice(from, 1)[0])
            return next
        })
    }

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
                    <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={handleSave}>Save</button>
                    <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={handleSend}>Send To All Immediately</button>
                </div>

                {error && <p className="auth-error">{error}</p>}
                {success && <p className="auth-success">{success}</p>}

                <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>

                    <div
                        className="stat-card"
                        style={{ flex: 1, minHeight: '200px', display: 'flex', flexDirection: 'column', gap: '16px' }}
                    >
                        <div className="field-group">
                            <label className="field-label">Background Color (Optional)</label>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <input
                                    type="color"
                                    value={bgColor || '#ffffff'}
                                    onChange={e => setBgColor(e.target.value)}
                                    style={{ width: 50, height: 40, padding: 2, borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer' }}
                                />
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => setBgColor('')}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        <div className="field-group">
                            <label className="field-label">Subject</label>
                            <input
                                className="field-input"
                                type="text"
                                placeholder="Email subject..."
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                            />
                        </div>

                        <hr style={{ borderColor: 'var(--border)', margin: '0' }} />

                        <div
                            onDragOver={e => e.preventDefault()}
                            onDrop={e => {
                                e.preventDefault()
                                const item = PALETTE.find(p => p.type === e.dataTransfer.getData('text'))
                                if (item) setFields(prev => [...prev, { ...item, uid: Date.now(), value: '' }])
                            }}
                            style={{ flex: 1, minHeight: '120px', display: 'flex', flexDirection: 'column', gap: '16px' }}
                        >
                            {fields.length === 0 && <p className="dash-hint">Drop fields here</p>}

                            {fields.map(field => (
                                <div
                                    key={field.uid}
                                    className="field-group"
                                    draggable
                                    onDragStart={e => e.dataTransfer.setData('text', String(field.uid))}
                                    onDragOver={e => e.preventDefault()}
                                    onDragEnd={e => {
                                        if (e.dataTransfer.dropEffect === 'none')
                                            setFields(prev => prev.filter(f => f.uid !== field.uid))
                                    }}
                                    onDrop={e => {
                                        e.preventDefault()
                                        const fromUid = Number(e.dataTransfer.getData('text'))
                                        if (fromUid) reorder(fromUid, field.uid)
                                    }}
                                    style={{ cursor: 'grab' }}
                                >
                                    <label className="field-label">{field.label}</label>
                                    {field.type === 'header' && <input className="field-input" type="text" placeholder="Header"
                                        style={{ fontSize: '20px', fontWeight: 700 }}
                                        onChange={e => updateValue(field.uid, e.target.value)} />}
                                    {field.type === 'body' && <TextEditor onChange={v => updateValue(field.uid, v)} />}
                                    {field.type === 'link' && <input className="field-input" type="url" placeholder="https://…"
                                        onChange={e => updateValue(field.uid, e.target.value)} />}
                                    {field.type === 'image' && (
                                        <input
                                            className="field-input"
                                            type="url"
                                            placeholder="Paste an image URL"
                                            onChange={e => updateValue(field.uid, e.target.value)}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '160px', flexShrink: 0 }}>
                        {PALETTE.map(item => (
                            <div
                                key={item.type}
                                className="stat-card card-hover"
                                draggable
                                onDragStart={e => e.dataTransfer.setData('text', item.type)}
                                style={{ cursor: 'grab', padding: '12px 14px', '--accent-color': 'transparent' }}
                            >
                                <div className="stat-label">{item.label}</div>
                            </div>
                        ))}
                    </div>

                </div>
            </main>
        </div>
    )
}

export default Mail