"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";
import { apiClient } from "@/lib/api-client";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<AuthUser | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const me = await apiClient<AuthUser>("/api/auth/me");
      return me;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    refresh().then((me) => {
      if (!cancelled) {
        setUser(me);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await apiClient<{ user: AuthUser }>("/api/auth/login", {
        method: "POST",
        body: { email, password }
      });
      setUser(result.user);
    },
    []
  );

  const register = useCallback(
    async (email: string, name: string, password: string) => {
      const result = await apiClient<{ user: AuthUser }>("/api/auth/register", {
        method: "POST",
        body: { email, name, password }
      });
      setUser(result.user);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await apiClient("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
