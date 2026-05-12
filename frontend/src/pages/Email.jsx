import './Dashboard.css'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { getEmailHTMLById } from '../api.js'
import TextEditor from '../TextEditor.jsx'
import DOMPurify from 'dompurify'

function Email() {
    const { emailId } = useParams()
    const navigate = useNavigate()
    const [valid, setValid] = useState(null)
    const [body, setBody] = useState('')

    useEffect(() => {
        async function checkCampaign() {
            try {
                const email = await getEmailHTMLById(emailId)
                setBody(email)
                setValid(true)
            } catch (err) {
                navigate('/')
            }
        }
        checkCampaign()
    }, [emailId])

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
                        <Link to="/" className="dash-brand-name">GoMail</Link>
                    </div>
                </div>
            </header>

            <main>
                {body ? <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(body) }} /> : 
                <span className="spinner" style={{ borderColor: 'rgba(232,160,48,0.2)', borderTopColor: 'var(--amber)', width: 28, height: 28, borderWidth: 3 }} />}
            </main>
        </div>
    )
}

export default Email