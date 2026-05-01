import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthLogin";

function SearchPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#edf2f7",
        padding: "28px",
        color: "#0f172a",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <div>
          <p style={{ margin: 0, color: "#475569" }}>Welcome back, {user?.email ?? "Analyst"}</p>
          <h1 style={{ margin: "10px 0 0", fontSize: "2rem" }}>Search dashboard</h1>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="button"
            onClick={() => navigate("/favorites")}
            style={{
              padding: "12px 18px",
              borderRadius: "999px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              cursor: "pointer",
            }}
          >
            Favorites
          </button>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: "12px 18px",
              borderRadius: "999px",
              border: "none",
              background: "#2563eb",
              color: "#ffffff",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <section
        style={{
          maxWidth: "920px",
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 24px 80px rgba(15, 23, 42, 0.08)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Protected search area</h2>
        <p style={{ color: "#64748b" }}>
          The login page loads first, and this page is only accessible after signing in.
        </p>
      </section>
    </main>
  );
}

export default SearchPage;
