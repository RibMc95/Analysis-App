import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthLogin'

type HomePageHeroProps = {
  subtitle: string
  universeCount: number
  isUniverseLoading: boolean
  isUniverseFallback: boolean
  universePreview: string[]
}

export function HomePageHero({ subtitle, universeCount, isUniverseLoading, isUniverseFallback, universePreview }: HomePageHeroProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const universeLabel = isUniverseLoading
    ? 'Syncing market universe...'
    : `${universeCount.toLocaleString()} symbols loaded${isUniverseFallback ? ' (fallback list)' : ''}`

  function handleLogout(): void {
    logout()
    navigate('/login')
  }

  return (
    <header className="hero-panel">
      <div className="hero-panel-inner">
        <div>
          <p className="eyebrow">Stock Intelligence</p>
          <p className="hero-welcome">Welcome back{user?.email ? `, ${user.email}` : ''}.</p>
          <h1>Ticker Search</h1>
          <p>{subtitle}</p>
          <p className="hero-universe-status">{universeLabel}</p>
          <div className="hero-preview-row" aria-label="Loaded symbol preview">
            {isUniverseLoading ? (
              <span className="hero-preview-pill">Loading symbols...</span>
            ) : (
              universePreview.map((ticker) => (
                <span key={ticker} className="hero-preview-pill">
                  {ticker}
                </span>
              ))
            )}
          </div>
        </div>

        <div className="hero-actions">
          <button type="button" onClick={() => navigate('/favorites')} className="hero-primary-button">
            Favorites
          </button>
          <button type="button" onClick={handleLogout} className="hero-secondary-button">
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}