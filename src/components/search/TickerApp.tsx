import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { InvalidTickerModal } from './InvalidTickerModal'
import { ResultsPanel } from './ResultsPanel'
import { SearchPanel } from './SearchPanel'
import type { SearchResult } from './types'
import { createPendingResult, isTickerFormatValid, normalizeTicker } from './utils'

export function TickerApp() {
  const [tickerInput, setTickerInput] = useState('')
  const [result, setResult] = useState<SearchResult | null>(null)
  const [invalidMessage, setInvalidMessage] = useState('')
  const [showInvalidModal, setShowInvalidModal] = useState(false)
  const [recentTickers, setRecentTickers] = useState<string[]>([])

  const headerSubtitle = useMemo(() => {
    if (!result) {
      return 'Search any ticker to prepare the valuation and growth dashboard.'
    }

    return `Ticker ${result.ticker} selected. Live company and metric data will populate after API wiring.`
  }, [result])

  function openInvalidModal(message: string): void {
    setInvalidMessage(message)
    setShowInvalidModal(true)
  }

  function storeRecentTicker(ticker: string): void {
    setRecentTickers((current) => [ticker, ...current.filter((item) => item !== ticker)].slice(0, 5))
  }

  function applyTicker(ticker: string): void {
    setTickerInput(ticker)
    setResult(createPendingResult(ticker))
    storeRecentTicker(ticker)
  }

  function handleSearch(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    const ticker = normalizeTicker(tickerInput)

    if (!isTickerFormatValid(ticker)) {
      openInvalidModal('Use 1-5 letters only, for example AAPL or MSFT.')
      return
    }

    applyTicker(ticker)
  }

  function handleQuickTicker(ticker: string): void {
    const normalizedTicker = normalizeTicker(ticker)

    if (!isTickerFormatValid(normalizedTicker)) {
      openInvalidModal('That quick-select ticker is invalid. Please try another.')
      return
    }

    applyTicker(normalizedTicker)
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
          onTickerInputChange={setTickerInput}
          onSearch={handleSearch}
          onQuickTicker={handleQuickTicker}
        />
        <ResultsPanel result={result} />
      </main>

      <InvalidTickerModal
        isOpen={showInvalidModal}
        message={invalidMessage}
        onClose={() => setShowInvalidModal(false)}
      />
    </div>
  )
}
