import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { fetchAllStockSymbols } from '../../API/finnhubService'
import type { StockSymbol } from '../../API/finnhubService'

type SearchPanelProps = {
    tickerInput: string
    recentTickers: string[]
    isLoading: boolean
    onTickerInputChange: (value: string) => void
    onSearch: (event: FormEvent<HTMLFormElement>) => void
    onQuickTicker: (ticker: string) => void
}

const POPULAR_TICKERS = ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'TSLA']

export function SearchPanel({
    tickerInput,
    recentTickers,
    isLoading,
    onTickerInputChange,
    onSearch,
    onQuickTicker,
}: SearchPanelProps) {
    const [allStocks, setAllStocks] = useState<StockSymbol[]>([])
    const [isLoadingSymbols, setIsLoadingSymbols] = useState(false)

    useEffect(() => {
        let isActive = true

        async function loadAllStocks(): Promise<void> {
            setIsLoadingSymbols(true)

            try {
                const symbols = await fetchAllStockSymbols()
                if (isActive) {
                    setAllStocks(symbols)
                }
            } catch {
                if (isActive) {
                    setAllStocks([])
                }
            } finally {
                if (isActive) {
                    setIsLoadingSymbols(false)
                }
            }
        }

        void loadAllStocks()

        return () => {
            isActive = false
        }
    }, [])

    return (
        <section className="search-panel">
            <form className="search-form" onSubmit={onSearch}>
                <label htmlFor="ticker-input">Ticker Symbol</label>
                <div className="input-row">
                    <input
                        id="ticker-input"
                        type="text"
                        maxLength={15}
                        placeholder="Ex. (AAPL or BRK.B)"
                        value={tickerInput}
                        disabled={isLoading}
                        onChange={(event) => onTickerInputChange(event.target.value)}
                    />
                    <button type="submit" disabled={isLoading}>{isLoading ? 'Loading...' : 'Search'}</button>
                </div>
            </form>

            <div className="chip-group">
                <p>Popular</p>
                {POPULAR_TICKERS.map((ticker) => (
                    <button key={ticker} type="button" className="chip" disabled={isLoading} onClick={() => onQuickTicker(ticker)}>
                        {ticker}
                    </button>
                ))}
            </div>

            {recentTickers.length > 0 && (
                <div className="chip-group">
                    <p>Recent</p>
                    {recentTickers.map((ticker) => (
                        <button key={ticker} type="button" className="chip muted" disabled={isLoading} onClick={() => onQuickTicker(ticker)}>
                            {ticker}
                        </button>
                    ))}
                </div>
            )}

            <div className="stock-list-card">
                <div className="stock-list-card-head">
                    <p>Stocks</p>
                    <span>{isLoadingSymbols ? 'Loading...' : `${allStocks.length} symbols`}</span>
                </div>

                <div className="stock-list-scroll" role="listbox" aria-label="All API stocks">
                    {allStocks.map((stock) => (
                        <button
                            key={stock.ticker}
                            type="button"
                            className="stock-list-item"
                            disabled={isLoading}
                            onClick={() => onQuickTicker(stock.ticker)}
                        >
                            <strong>{stock.ticker}</strong>
                            <span>{stock.company}</span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    )
}
