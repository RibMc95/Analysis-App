
import type { SearchResult } from './types'
import { formatNetIncome, formatPercent, formatPrice, formatRatio } from './utils'


type ResultsPanelProps = {
    result: SearchResult | null
    isLoading: boolean
    isRefreshingQuote?: boolean
    isFavorite: boolean
    onToggleFavorite: () => void
    onRefresh?: () => void
    favorites: string[]
    onSelectFavorite?: (ticker: string) => void
}

export function ResultsPanel({ result, isLoading, isRefreshingQuote = false, isFavorite, onToggleFavorite, onRefresh, favorites, onSelectFavorite }: ResultsPanelProps) {
    return (
        <section className="result-panel">
            {!result && (
                <div className="empty-state">
                    {favorites.length > 0 ? (
                        <>
                            <h2>Current favorites</h2>
                            <p>Select a saved ticker or search a new one to populate this dashboard with company details and key metrics.</p>
                            <div className="favorites-preview-list" aria-label="Current favorites">
                                {favorites.map((ticker) => (
                                    <button
                                        key={ticker}
                                        type="button"
                                        className="favorites-preview-chip"
                                        onClick={() => onSelectFavorite?.(ticker)}
                                        disabled={!onSelectFavorite}
                                    >
                                        {ticker}
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <h2>No ticker selected</h2>
                            <p>Search a ticker to populate this dashboard with company details and key metrics.</p>
                        </>
                    )}
                </div>
            )}

            {result && (
                <>
                    <article className="stock-header">
                        <div>
                            <p className="ticker">{result.ticker}</p>
                            <h2>{result.company ?? 'Company details coming from API'}</h2>
                            <p>{result.industry ?? (isLoading ? 'Loading industry...' : 'Industry unavailable')}</p>
                        </div>
                        <div className="price-block">
                            {onRefresh && (
                                <button
                                    type="button"
                                    className="favorite-button"
                                    onClick={onRefresh}
                                    disabled={isLoading || isRefreshingQuote}
                                    aria-label="Refresh stock data"
                                >
                                    {isRefreshingQuote ? 'Refreshing...' : 'Refresh'}
                                </button>
                            )}
                            <button
                                type="button"
                                className={isFavorite ? 'favorite-button active' : 'favorite-button'}
                                onClick={onToggleFavorite}
                                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                            >
                                {isFavorite ? '★ Favorited' : '☆ Add to favorites'}
                            </button>
                            <p className="price">{formatPrice(result.price)}</p>
                            <p
                                className={
                                    result.dayChangePercent === null
                                        ? 'change flat'
                                        : result.dayChangePercent >= 0
                                            ? 'change up'
                                            : 'change down'
                                }
                            >
                                {formatPercent(result.dayChangePercent)} today
                            </p>
                        </div>
                    </article>

                    <div className="metrics-grid">
                        {result.metrics.peRatio !== null && (
                            <article className="metric-card">
                                <p>P/E Ratio</p>
                                <h3>{formatRatio(result.metrics.peRatio)}</h3>
                            </article>
                        )}
                        {result.metrics.netIncomeGrowth !== null && (
                            <article className="metric-card">
                                <p>Net Income Growth</p>
                                <h3>{formatPercent(result.metrics.netIncomeGrowth)}</h3>
                            </article>
                        )}
                        {result.metrics.peOverGrowth !== null && (
                            <article className="metric-card">
                                <p>P/E / Growth</p>
                                <h3>{formatRatio(result.metrics.peOverGrowth)}</h3>
                            </article>
                        )}
                        {result.metrics.netIncomeLastTwoYears.length === 2 && (
                            <article className="metric-card wide">
                                <p>Net Income (Last 2 Years)</p>
                                <h3>
                                    {result.metrics.netIncomeLastTwoYears[0].year ?? 'Latest'}: {formatNetIncome(result.metrics.netIncomeLastTwoYears[0].value)} | {result.metrics.netIncomeLastTwoYears[1].year ?? 'Prior'}: {formatNetIncome(result.metrics.netIncomeLastTwoYears[1].value)}
                                </h3>
                            </article>
                        )}
                        {result.metrics.marketCap !== null && (
                            <article className="metric-card">
                                <p>Market Cap</p>
                                <h3>{result.metrics.marketCap}</h3>
                            </article>
                        )}
                        {result.metrics.fiftyTwoWeekRange !== null && (
                            <article className="metric-card wide">
                                <p>52-Week Range</p>
                                <h3>{result.metrics.fiftyTwoWeekRange}</h3>
                            </article>
                        )}
                    </div>
                </>
            )}
        </section>
    )
}
