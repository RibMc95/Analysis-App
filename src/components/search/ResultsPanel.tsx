import type { SearchResult } from "./types";
import {
  formatMarketCap,
  formatNetIncome,
  formatPercent,
  formatPrice,
  formatRatio,
} from "./utils";
import { addFavoriteStock } from "../../services/favoritesService";

type ResultsPanelProps = {
  result: SearchResult | null;
  isLoading: boolean;
};

export function ResultsPanel({ result, isLoading }: ResultsPanelProps) {
  // Carvin note:
  // Temporary favorite function for database testing.
  // userId is hardcoded until login/authentication provides the real logged-in user.
  const handleAddFavorite = async () => {
    if (!result) return;

    try {
      await addFavoriteStock({
        userId: "testUser1",
        ticker: result.ticker,
        companyName: result.company || "Unknown Company",
        industry: result.industry || "Unknown",
        growthRate: result.metrics.netIncomeGrowth || 0,
        peRatio: result.metrics.peRatio || 0,
        growthOverPe: result.metrics.growthOverPe || 0,
      });

      alert("Stock added to favorites");
    } catch (error) {
      console.error("Error saving favorite:", error);
      alert("Could not save favorite stock");
    }
  };

  return (
    <section className="results-panel">
      {!result && (
        <div className="empty-state">
          <h2>No ticker selected</h2>
          <p>
            Search a ticker to populate this dashboard with company details and
            key metrics.
          </p>
        </div>
      )}

      {result && (
        <>
          <div className="company-header">
            <p className="ticker-label">{result.ticker}</p>
            <h2>{result.company ?? "Company details coming from API"}</h2>
            <p>
              {result.industry ??
                (isLoading ? "Loading industry..." : "Industry unavailable")}
            </p>

            {/* Carvin note:
                Temporary Favorite button for database testing.
                Frontend team can style or move this later.
            */}
            <button className="favorite-button" onClick={handleAddFavorite}>
  Add to Favorites
</button>
          </div>

          <div className="price-card">
            <h3>{formatPrice(result.price)}</h3>
            <p
              className={
                result.dayChangePercent && result.dayChangePercent >= 0
                  ? "change up"
                  : "change down"
              }
            >
              {formatPercent(result.dayChangePercent)} today
            </p>
          </div>

          <div className="metrics-grid">
            <article>
              <p>P/E Ratio</p>
              <h3>{formatRatio(result.metrics.peRatio)}</h3>
            </article>

            <article>
              <p>Net Income Growth</p>
              <h3>{formatPercent(result.metrics.netIncomeGrowth)}</h3>
            </article>

            <article>
              <p>Growth / P:E</p>
              <h3>{formatRatio(result.metrics.growthOverPe)}</h3>
            </article>

            <article>
              <p>Net Income Last 2 Years</p>
              <h3>
                {result.metrics.netIncomeLastTwoYears.length === 2
                  ? `${
                      result.metrics.netIncomeLastTwoYears[0].year ?? "Latest"
                    }: ${formatNetIncome(
                      result.metrics.netIncomeLastTwoYears[0].value
                    )} | ${
                      result.metrics.netIncomeLastTwoYears[1].year ?? "Prior"
                    }: ${formatNetIncome(
                      result.metrics.netIncomeLastTwoYears[1].value
                    )}`
                  : "N/A"}
              </h3>
            </article>

            <article>
              <p>Market Cap</p>
              <h3>{result.metrics.marketCap ?? formatMarketCap(null)}</h3>
            </article>

            <article>
              <p>52-Week Range</p>
              <h3>{result.metrics.fiftyTwoWeekRange ?? "N/A"}</h3>
            </article>
          </div>
        </>
      )}
    </section>
  );
}
import type { SearchResult } from './types'
import { formatNetIncome, formatPercent, formatPrice, formatRatio } from './utils'

type ResultsPanelProps = {
    result: SearchResult | null
    isLoading: boolean
    isFavorite: boolean
    onToggleFavorite: () => void
}

export function ResultsPanel({ result, isLoading, isFavorite, onToggleFavorite }: ResultsPanelProps) {
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
                        {result.metrics.growthOverPe !== null && (
                            <article className="metric-card">
                                <p>Growth / P:E</p>
                                <h3>{formatRatio(result.metrics.growthOverPe)}</h3>
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
