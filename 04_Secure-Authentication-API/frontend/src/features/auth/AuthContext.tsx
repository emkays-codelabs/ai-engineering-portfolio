import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";

import * as api from "@/services/api-client";
import type { User } from "@/types/auth";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  // Access tokens live only in memory (never localStorage — see HLD Section 7),
  // so on a fresh page load we try a silent refresh against the HttpOnly cookie
  // to restore the session without asking the user to log in again.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const tokens = await api.refresh();
        const currentUser = await api.getCurrentUser(tokens.access_token);
        if (!cancelled) {
          setAccessToken(tokens.access_token);
          setUser(currentUser);
          setStatus("authenticated");
        }
      } catch {
        if (!cancelled) {
          setStatus("unauthenticated");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await api.login(email, password);
    const currentUser = await api.getCurrentUser(tokens.access_token);
    setAccessToken(tokens.access_token);
    setUser(currentUser);
    setStatus("authenticated");
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    await api.register(email, password);
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setAccessToken(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, status, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
