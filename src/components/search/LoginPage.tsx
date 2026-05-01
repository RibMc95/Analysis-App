import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthLogin";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    login(email, password);
    setError("");
    navigate("/search");
  };

  return (
    <div className="page-shell">
      <header className="hero-panel hero-panel--centered login-hero">
        <p className="eyebrow">Stock Intelligence</p>
        <h2 className="login-hero-title">Login to continue</h2>
        <p className="login-hero-copy">Enter your credentials and get started with the stock search experience.</p>
      </header>

      <main className="login-page-main">
        <section className="login-panel">
          <form onSubmit={handleSubmit}>
            <label style={{ display: "block", marginBottom: "1rem", fontWeight: 700 }}>
              Email address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  marginTop: "0.5rem",
                  padding: "0.75rem 0.9rem",
                  border: "1px solid rgba(13, 50, 110, 0.2)",
                  borderRadius: "0.75rem",
                  fontSize: "1rem",
                }}
              />
            </label>

            <label style={{ display: "block", marginBottom: "1.5rem", fontWeight: 700 }}>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                style={{
                  width: "100%",
                  marginTop: "0.5rem",
                  padding: "0.75rem 0.9rem",
                  border: "1px solid rgba(13, 50, 110, 0.2)",
                  borderRadius: "0.75rem",
                  fontSize: "1rem",
                }}
              />
            </label>

            {error && (
              <p style={{ color: "var(--down)", marginTop: "0", marginBottom: "1.5rem", fontWeight: 600 }}>
                {error}
              </p>
            )}

            <button type="submit" className="login-submit-button">
              Sign in
            </button>
          </form>

          <div style={{ marginTop: "1.5rem", color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center" }}>
            <p style={{ margin: "0 0 0.5rem" }}>Need a demo account?</p>
            <p style={{ margin: 0 }}>
              Use <strong>demo@example.com</strong> and any password to continue.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default LoginPage;
