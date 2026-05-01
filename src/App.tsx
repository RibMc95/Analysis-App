import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/search/AuthLogin";
import LoginPage from "./components/search/LoginPage";
import { TickerApp } from "./components/search/TickerApp";
import FavoritesPage from "./pages/FavoritesPage";
import ProtectedRoute from "./components/search/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Default route */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Search */}
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <TickerApp />
              </ProtectedRoute>
            }
          />

          {/* Protected Favorites */}
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;