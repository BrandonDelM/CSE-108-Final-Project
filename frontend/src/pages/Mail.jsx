import './Dashboard.css'
import { Link } from 'react-router-dom'
import { useState, useRef } from 'react'

const PALETTE = [
    { type: 'header', label: 'Header' },
    { type: 'body',   label: 'Body Text' },
    { type: 'image',  label: 'Image' },
    { type: 'link',   label: 'Link' },
]

function ImageField() {
    const fileRef = useRef()
    const [src, setSrc] = useState(null)

    return <>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => setSrc(URL.createObjectURL(e.target.files[0]))} />
        {src
            ? <img src={src} alt="" style={{ maxWidth: '100%', borderRadius: '6px' }} />
            : <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current.click()}>Add Image</button>
        }
    </>
}

function Mail({ user, onLogout }) {
    const [fields, setFields] = useState([])

    function reorder(fromUid, toUid) {
        setFields(prev => {
            const from = prev.findIndex(f => f.uid === fromUid)
            const to   = prev.findIndex(f => f.uid === toUid)
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
                        <span className="dash-brand-name">GoMail</span>
                    </div>
                    <div className="dash-header-right">
                        <span className="dash-username">{user.username}</span>
                        <button className="btn btn-ghost btn-sm" onClick={onLogout}>Sign out</button>
                    </div>
                </div>
            </header>

            <main className="dash-main container fade-in">
                <Link to="/" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Back</Link>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>

                    <div
                        className="stat-card"
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => {
                            e.preventDefault()
                            const item = PALETTE.find(p => p.type === e.dataTransfer.getData('text'))
                            if (item) setFields(prev => [...prev, { ...item, uid: Date.now() }])
                        }}
                        style={{ flex: 1, minHeight: '200px', display: 'flex', flexDirection: 'column', gap: '16px' }}
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
                                {field.type === 'image'  && <ImageField />}
                                {field.type === 'header' && <input className="field-input" type="text" placeholder="Header" style={{ fontSize: '20px', fontWeight: 600 }} />}
                                {field.type === 'body'   && <textarea className="field-input" placeholder="Body text" rows={4} style={{ resize: 'vertical' }} />}
                                {field.type === 'link'   && <input className="field-input" type="url" placeholder="https://…" />}
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '160px', flexShrink: 0 }}>
                        {PALETTE.map(item => (
                            <div
                                key={item.type}
                                className="stat-card"
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