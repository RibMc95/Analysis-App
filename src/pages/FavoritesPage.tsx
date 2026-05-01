import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ResultsPanel } from "../components/search/ResultsPanel";
import { fetchStockData } from "../API/finnhubService";
import { formatMarketCap } from "../components/search/utils";
import type { SearchResult } from "../components/search/types";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [focusedResult, setFocusedResult] = useState<SearchResult | null>(null);
  const [isFocusedLoading, setIsFocusedLoading] = useState(false);
  const navigate = useNavigate();

  async function viewTicker(ticker: string): Promise<void> {
    setIsFocusedLoading(true);
    setFocusedResult({ ticker, company: null, industry: null, price: null, dayChangePercent: null, metrics: { peRatio: null, netIncomeGrowth: null, growthOverPe: null, netIncomeLastTwoYears: [], marketCap: null, fiftyTwoWeekRange: null } });
    try {
      const data = await fetchStockData(ticker);
      setFocusedResult({
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
          fiftyTwoWeekRange: data.fiftyTwoWeekHigh != null && data.fiftyTwoWeekLow != null
            ? `$${data.fiftyTwoWeekLow.toFixed(2)} - $${data.fiftyTwoWeekHigh.toFixed(2)}`
            : null,
        },
      });
    } catch {
      setFocusedResult(null);
    } finally {
      setIsFocusedLoading(false);
    }
  }

  function removeFavorite(ticker: string) {
    const updated = favorites.filter((fav) => fav !== ticker);
    setFavorites(updated);
    window.localStorage.setItem("favorites", JSON.stringify(updated));
  }

  useEffect(() => {
    const stored = window.localStorage.getItem("favorites") ?? "[]";
    try {
      setFavorites(JSON.parse(stored));
    } catch {
      setFavorites([]);
    }
  }, []);

  if (focusedResult !== null || isFocusedLoading) {
    return (
      <div className="page-shell">
        <header className="hero-panel favorites-hero">
          <p className="eyebrow">Saved Watchlist</p>
          <h1>Favorites</h1>
          <p>Keep your most important tickers in one place for faster tracking and review.</p>
        </header>
        <div style={{ marginBottom: '0.75rem' }}>
          <button
            type="button"
            onClick={() => setFocusedResult(null)}
            style={{ border: '1px solid rgba(13,50,110,0.22)', background: 'rgba(255,255,255,0.85)', borderRadius: '999px', padding: '0.45rem 0.9rem', fontWeight: 700, cursor: 'pointer' }}
          >
            ← Back to Favorites
          </button>
        </div>
        <ResultsPanel
          result={focusedResult}
          isLoading={isFocusedLoading}
          isFavorite={focusedResult ? favorites.includes(focusedResult.ticker) : false}
          favorites={favorites}
          onToggleFavorite={() => {
            if (!focusedResult) return;
            const updated = favorites.includes(focusedResult.ticker)
              ? favorites.filter((f) => f !== focusedResult.ticker)
              : [focusedResult.ticker, ...favorites];
            setFavorites(updated);
            window.localStorage.setItem('favorites', JSON.stringify(updated));
          }}
        />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <header className="hero-panel favorites-hero">
        <p className="eyebrow">Saved Watchlist</p>
        <h1>Favorites</h1>
        <p>Keep your most important tickers in one place for faster tracking and review.</p>
      </header>

      <section className="result-panel" style={{ minHeight: 320, padding: "2rem", gap: "1.25rem" }}>
        {favorites.length === 0 ? (
          <div style={{ textAlign: "center", width: "100%" }}>
            <h2 style={{ margin: 0 }}>No favorites added yet</h2>
            <p style={{ color: "var(--text-muted)", marginTop: "0.8rem" }}>
              Add tickers from the search page to build your favorites list.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "0.85rem" }}>
            {favorites.map((ticker) => (
              <div
                key={ticker}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem 1.1rem",
                  borderRadius: "1rem",
                  border: "1px solid rgba(13, 50, 110, 0.12)",
                  background: "rgba(255, 255, 255, 0.85)",
                }}
              >
                <span style={{ fontWeight: 700 }}>{ticker}</span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => void viewTicker(ticker)}
                    className="favorites-page-action-button"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFavorite(ticker)}
                    style={{
                      border: "1px solid rgba(181, 48, 48, 0.3)",
                      borderRadius: "0.9rem",
                      padding: "0.7rem 1rem",
                      background: "rgba(255, 255, 255, 0.9)",
                      color: "var(--down)",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate("/search")}
          className="favorites-page-action-button favorites-page-action-button--centered"
        >
          Back to Search
        </button>
      </section>
    </div>
  );
}
