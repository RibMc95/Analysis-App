import type { FormEvent } from 'react'

type SearchPanelProps = {
    tickerInput: string
    recentTickers: string[]
    onTickerInputChange: (value: string) => void
    onSearch: (event: FormEvent<HTMLFormElement>) => void
    onQuickTicker: (ticker: string) => void
}

const POPULAR_TICKERS = ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'TSLA']

export function SearchPanel({
    tickerInput,
    recentTickers,
    onTickerInputChange,
    onSearch,
    onQuickTicker,
}: SearchPanelProps) {
    return (
        <section className="search-panel">
            <form className="search-form" onSubmit={onSearch}>
                <label htmlFor="ticker-input">Ticker Symbol</label>
                <div className="input-row">
                    <input
                        id="ticker-input"
                        type="text"
                        maxLength={5}
                        placeholder="Enter ticker (AAPL)"
                        value={tickerInput}
                        onChange={(event) => onTickerInputChange(event.target.value)}
                    />
                    <button type="submit">Search</button>
                </div>
            </form>

            <div className="chip-group">
                <p>Popular</p>
                {POPULAR_TICKERS.map((ticker) => (
                    <button key={ticker} type="button" className="chip" onClick={() => onQuickTicker(ticker)}>
                        {ticker}
                    </button>
                ))}
            </div>

            {recentTickers.length > 0 && (
                <div className="chip-group">
                    <p>Recent</p>
                    {recentTickers.map((ticker) => (
                        <button key={ticker} type="button" className="chip muted" onClick={() => onQuickTicker(ticker)}>
                            {ticker}
                        </button>
                    ))}
                </div>
            )}
        </section>
    )
}
