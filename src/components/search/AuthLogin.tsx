import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type AuthUser = {
  email: string;
  userId: string;
} | null;

type AuthContextType = {
  user: AuthUser;
  login: (email: string, password: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(() => {
    const savedUser = localStorage.getItem("stockAppUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (email: string, _password: string) => {
    const loggedInUser = {
      email,
      userId: email.toLowerCase(),
    };

    setUser(loggedInUser);
    localStorage.setItem("stockAppUser", JSON.stringify(loggedInUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("stockAppUser");
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