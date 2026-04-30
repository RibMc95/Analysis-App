import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
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
  const [isLoading, setIsLoading] = useState(false)

  const headerSubtitle = useMemo(() => {
    if (!result) {
      return 'Search any ticker to prepare the valuation and growth dashboard.'
    }

    return `Ticker ${result.ticker} selected. Live company and metric data are connected from the stock API.`
  }, [result])

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
      openInvalidModal('Use 1-5 letters only, for example AAPL or MSFT.')
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

  return (
    <div className="page-shell">
      <header className="hero-panel">
        <p className="eyebrow">Stock Intelligence</p>
        <h1>Ticker Search</h1>
        <p>{headerSubtitle}</p>
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
        <ResultsPanel result={result} isLoading={isLoading} />
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
