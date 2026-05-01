import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { loginUser } from "../../services/userService";

type AuthUser = {
  email: string;
  userId: string;
  createdAt?: string;
} | null;

type AuthContextType = {
  user: AuthUser;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(() => {
    const savedUser = window.localStorage.getItem("stockAppUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email: string, password: string) => {
    const loggedInUser = await loginUser(email, password);

    setUser(loggedInUser);
    window.localStorage.setItem("stockAppUser", JSON.stringify(loggedInUser));
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem("stockAppUser");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}