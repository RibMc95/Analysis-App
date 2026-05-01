import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const navigate = useNavigate();

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

  return (
    <div className="page-shell">
      <header className="hero-panel">
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
                    onClick={() => navigate("/search")}
                    style={{
                      border: "none",
                      borderRadius: "0.9rem",
                      padding: "0.7rem 1rem",
                      background: "linear-gradient(135deg, #14b8a6, #0ea5e9)",
                      color: "#ffffff",
                      cursor: "pointer",
                    }}
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
          style={{
            alignSelf: "center",
            padding: "0.85rem 1.2rem",
            borderRadius: "0.95rem",
            border: "none",
            background: "linear-gradient(135deg, #14b8a6, #0ea5e9)",
            color: "#ffffff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Back to Search
        </button>
      </section>
    </div>
  );
}
