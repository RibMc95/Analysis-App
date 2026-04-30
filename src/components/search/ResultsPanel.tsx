import type { SearchResult } from './types'
import { formatMarketCap, formatNetIncome, formatPercent, formatPrice, formatRatio } from './utils'

type ResultsPanelProps = {
    result: SearchResult | null
    isLoading: boolean
}

export function ResultsPanel({ result, isLoading }: ResultsPanelProps) {
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
                            <p>{result.industry ?? (isLoading ? 'Loading industry...' : 'Industry unavailable')}</p>
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
                        <article className="metric-card wide">
                            <p>Net Income (Last 2 Years)</p>
                            <h3>
                                {result.metrics.netIncomeLastTwoYears.length === 2
                                    ? `${result.metrics.netIncomeLastTwoYears[0].year ?? 'Latest'}: ${formatNetIncome(result.metrics.netIncomeLastTwoYears[0].value)} | ${result.metrics.netIncomeLastTwoYears[1].year ?? 'Prior'}: ${formatNetIncome(result.metrics.netIncomeLastTwoYears[1].value)}`
                                    : 'N/A'}
                            </h3>
                        </article>
                        <article className="metric-card">
                            <p>Market Cap</p>
                            <h3>{result.metrics.marketCap ?? formatMarketCap(null)}</h3>
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
