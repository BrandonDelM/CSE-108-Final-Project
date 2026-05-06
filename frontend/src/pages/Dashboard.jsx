import './Dashboard.css'

export default function Dashboard({ user, onLogout }) {
  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

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
        <div className="dash-welcome">
          <p className="dash-greeting">{greeting}, <strong>{user.username}</strong>.</p>
        </div>
      </main>
    </div>
  )
}