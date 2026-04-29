import type { SearchResult } from './types'
import { formatPercent, formatPrice, formatRatio } from './utils'

type ResultsPanelProps = {
    result: SearchResult | null
}

export function ResultsPanel({ result }: ResultsPanelProps) {
    return (
        <section className="result-panel">
            {!result && (
                <div className="empty-state">
                    <h2>No ticker selected</h2>
                    <p>Search a ticker to populate this dashboard with company details and key metrics.</p>
                </div>
            )}

            {result && (
                <>
                    <article className="stock-header">
                        <div>
                            <p className="ticker">{result.ticker}</p>
                            <h2>{result.company ?? 'Company details coming from API'}</h2>
                            <p>{result.industry ?? 'Industry will load after API integration'}</p>
                        </div>
                        <div className="price-block">
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
                        <article className="metric-card">
                            <p>P/E Ratio</p>
                            <h3>{formatRatio(result.metrics.peRatio)}</h3>
                        </article>
                        <article className="metric-card">
                            <p>Net Income Growth</p>
                            <h3>{formatPercent(result.metrics.netIncomeGrowth)}</h3>
                        </article>
                        <article className="metric-card">
                            <p>Growth / P:E</p>
                            <h3>{formatRatio(result.metrics.growthOverPe)}</h3>
                        </article>
                        <article className="metric-card">
                            <p>Market Cap</p>
                            <h3>{result.metrics.marketCap ?? 'N/A'}</h3>
                        </article>
                        <article className="metric-card wide">
                            <p>52-Week Range</p>
                            <h3>{result.metrics.fiftyTwoWeekRange ?? 'N/A'}</h3>
                        </article>
                    </div>
                </>
            )}
        </section>
    )
}
