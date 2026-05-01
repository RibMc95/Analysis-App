import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthLogin'
import { InvalidTickerModal } from './InvalidTickerModal'
import { ResultsPanel } from './ResultsPanel'
import { SearchPanel } from './SearchPanel'
import type { SearchResult } from './types'
import { createPendingResult, formatMarketCap, isTickerFormatValid, normalizeTicker } from './utils'
import { fetchStockData } from '../../API/finnhubService'
import type { FinnhubStockData } from '../../API/finnhubService'

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
      growthOverPe: data.growthOverPe ?? null,
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

  function toggleFavorite(): void {
    if (!result) {
      return
    }

    setFavorites((current) => {
      if (current.includes(result.ticker)) {
        return current.filter((item) => item !== result.ticker)
      }

      return [result.ticker, ...current]
    })
  }

  function handleLogout(): void {
    logout()
    navigate('/login')
  }

  useEffect(() => {
    window.localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

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
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
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
    </div>
  )
}
