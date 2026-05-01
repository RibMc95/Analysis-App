import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthLogin'
import { InvalidTickerModal } from './InvalidTickerModal'
import { ResultsPanel } from './ResultsPanel'
import { SearchPanel } from './SearchPanel'
import type { SearchResult } from './types'
import { createPendingResult, formatMarketCap, isTickerFormatValid, normalizeTicker } from './utils'
import { fetchStockData, fetchStockQuote } from '../../API/finnhubService'
import type { FinnhubStockData } from '../../API/finnhubService'
import { addFavoriteStock, deleteFavoriteStock, getFavoriteStocks } from '../../services/favoritesService'

const QUOTE_REFRESH_MS = 20_000

function buildFiftyTwoWeekRange(high: number | null | undefined, low: number | null | undefined): string | null {
  if (typeof low === 'number' && typeof high === 'number') {
    return `$${low.toFixed(2)} - $${high.toFixed(2)}`
  }
  return null
}

function mapDataToSearchResult(ticker: string, data: FinnhubStockData): SearchResult {
  return {
    ticker: data.ticker ?? ticker,
    company: data.company ?? null,
    industry: data.industry ?? null,
    price: data.currentPrice ?? null,
    dayChangePercent: data.dayChangePercent ?? null,
    metrics: {
      peRatio: data.peRatio ?? null,
      netIncomeGrowth: data.netIncomeGrowthRate ?? null,
      peOverGrowth: data.peOverGrowth ?? null,
      netIncomeLastTwoYears: data.netIncomeLastTwoYears ?? [],
      marketCap: formatMarketCap(data.marketCap ?? null),
      fiftyTwoWeekRange: buildFiftyTwoWeekRange(data.fiftyTwoWeekHigh, data.fiftyTwoWeekLow),
    },
  }
}

export function TickerApp() {
  const [tickerInput, setTickerInput] = useState('')
  const [result, setResult] = useState<SearchResult | null>(null)
  const [invalidTitle, setInvalidTitle] = useState('Invalid ticker')
  const [invalidMessage, setInvalidMessage] = useState('')
  const [showInvalidModal, setShowInvalidModal] = useState(false)
  const [recentTickers, setRecentTickers] = useState<string[]>([])
  const [favorites, setFavorites] = useState<string[]>(() => {
    const stored = window.localStorage.getItem('favorites')
    if (!stored) {
      return []
    }

    try {
      return JSON.parse(stored) as string[]
    } catch {
      return []
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshingQuote, setIsRefreshingQuote] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  function openInvalidModal(message: string, title = 'Invalid ticker'): void {
    setInvalidTitle(title)
    setInvalidMessage(message)
    setShowInvalidModal(true)
  }

  function storeRecentTicker(ticker: string): void {
    setRecentTickers((current) => [ticker, ...current.filter((item) => item !== ticker)].slice(0, 5))
  }

  async function applyTicker(ticker: string): Promise<void> {
    setTickerInput(ticker)
    setResult(createPendingResult(ticker))
    storeRecentTicker(ticker)

    setIsLoading(true)

    try {
      const data = await fetchStockData(ticker)
      setResult(mapDataToSearchResult(ticker, data))
    } catch (error) {
      setResult(null)
      const message = error instanceof Error ? error.message : 'Unable to load ticker data.'
      const isRateLimit =
        message.toLowerCase().includes('rate limit') ||
        (error instanceof Object && 'status' in error && (error as { status: number }).status === 429)
      const title = isRateLimit ? 'Temporarily unavailable' : 'Request failed'
      openInvalidModal(message, title)
    } finally {
      setIsLoading(false)
    }
  }

  async function refreshQuote(ticker: string, showLoading = false): Promise<void> {
    if (showLoading) {
      setIsRefreshingQuote(true)
    }

    try {
      const quote = await fetchStockQuote(ticker)
      setResult((current) => {
        if (!current || current.ticker !== ticker) {
          return current
        }

        return {
          ...current,
          price: quote.currentPrice,
          dayChangePercent: quote.dayChangePercent,
        }
      })
    } catch (error) {
      if (showLoading) {
        const message = error instanceof Error ? error.message : 'Unable to refresh stock quote.'
        const isRateLimit =
          message.toLowerCase().includes('rate limit') ||
          (error instanceof Object && 'status' in error && (error as { status: number }).status === 429)
        const title = isRateLimit ? 'Temporarily unavailable' : 'Refresh failed'
        openInvalidModal(message, title)
      }
    } finally {
      if (showLoading) {
        setIsRefreshingQuote(false)
      }
    }
  }

  async function handleManualRefresh(): Promise<void> {
    if (!result) {
      return
    }

    setIsRefreshingQuote(true)
    try {
      await applyTicker(result.ticker)
    } finally {
      setIsRefreshingQuote(false)
    }
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    const ticker = normalizeTicker(tickerInput)

    if (!isTickerFormatValid(ticker)) {
      openInvalidModal('Use 1-15 characters (letters, numbers, dot, dash, slash), for example AAPL or BRK.B.')
      return
    }

    await applyTicker(ticker)
  }

  async function handleQuickTicker(ticker: string): Promise<void> {
    const normalizedTicker = normalizeTicker(ticker)

    if (!isTickerFormatValid(normalizedTicker)) {
      openInvalidModal('That quick-select ticker is invalid. Please try another.')
      return
    }

    await applyTicker(normalizedTicker)
  }

  async function toggleFavorite(): Promise<void> {
    if (!result) {
      return
    }

    if (!user?.email) {
      openInvalidModal('Please log in before adding favorites.', 'Login required')
      return
    }

    const userId = user.email.toLowerCase()
    const ticker = result.ticker

    try {
      if (favorites.includes(ticker)) {
        await deleteFavoriteStock(userId, ticker)
        setFavorites((current) => current.filter((item) => item !== ticker))
        return
      }

      await addFavoriteStock({
        userId,
        ticker,
        companyName: result.company || 'Unknown Company',
        industry: result.industry || 'Unknown',
        growthRate: result.metrics.netIncomeGrowth || 0,
        peRatio: result.metrics.peRatio || 0,
        peOverGrowth: result.metrics.peOverGrowth || 0,
      })

      setFavorites((current) => [ticker, ...current.filter((item) => item !== ticker)])
    } catch (error) {
      console.error('Error updating favorite:', error)
      openInvalidModal('Could not update favorites. Make sure the backend and database are running.', 'Favorites error')
    }
  }

  function handleLogout(): void {
    logout()
    navigate('/login')
  }

  useEffect(() => {
    async function loadFavoritesFromDatabase() {
      if (!user?.email) {
        return
      }

      try {
        const savedFavorites = await getFavoriteStocks(user.email.toLowerCase())
        const savedTickers = savedFavorites.map((stock: { ticker: string }) => stock.ticker)
        setFavorites(savedTickers)
      } catch (error) {
        console.error('Error loading favorites:', error)
      }
    }

    loadFavoritesFromDatabase()
  }, [user?.email])

  useEffect(() => {
    window.localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    if (!result?.ticker) {
      return
    }

    const ticker = result.ticker

    const refreshIfVisible = (): void => {
      if (document.visibilityState === 'visible') {
        void refreshQuote(ticker)
      }
    }

    const intervalId = window.setInterval(refreshIfVisible, QUOTE_REFRESH_MS)
    document.addEventListener('visibilitychange', refreshIfVisible)

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', refreshIfVisible)
    }
  }, [result?.ticker])

  const isFavorite = result ? favorites.includes(result.ticker) : false

  return (
    <div className="page-shell">
      <header className="hero-panel hero-panel--centered">
        <p className="eyebrow">Stock Intelligence</p>
        <p style={{ margin: 0, opacity: 0.9, marginBottom: '0.75rem' }}>
          Welcome back{user?.email ? `, ${user.email}` : ''}.
        </p>
        <h1>Ticker Search</h1>
        <p>Search any ticker to prepare the valuation and growth dashboard.</p>
        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => navigate('/favorites')}
            className="hero-primary-button"
          >
            Favorites
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="hero-secondary-button"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="content-grid">
        <SearchPanel
          tickerInput={tickerInput}
          recentTickers={recentTickers}
          isLoading={isLoading}
          onTickerInputChange={setTickerInput}
          onSearch={handleSearch}
          onQuickTicker={handleQuickTicker}
        />
        <ResultsPanel
          result={result}
          isLoading={isLoading}
          isRefreshingQuote={isRefreshingQuote}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          onRefresh={() => void handleManualRefresh()}
          favorites={favorites}
          onSelectFavorite={handleQuickTicker}
        />
      </main>

      <InvalidTickerModal
        isOpen={showInvalidModal}
        title={invalidTitle}
        message={invalidMessage}
        onClose={() => setShowInvalidModal(false)}
      />

      <footer className="app-footer">
        <div className="app-footer__inner">
          <span className="app-footer__brand">Stock Intelligence</span>
          <nav className="app-footer__links" aria-label="Footer navigation">
            <a href="https://finnhub.io" target="_blank" rel="noopener noreferrer">Data by Finnhub</a>
            <span aria-hidden="true">·</span>
            <a href="https://github.com/RibMc95/Analysis-App" target="_blank" rel="noopener noreferrer">GitHub</a>
          </nav>
          <p className="app-footer__copy">&copy; {new Date().getFullYear()} Analysis App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}