import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { UserResponse } from "@/api/types";
import { fetchMe, login as apiLogin, register as apiRegister, setToken, removeToken, getToken } from "@/api/client";
import type { UserLogin, UserRegister } from "@/api/types";

interface AuthState {
  user: UserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: UserLogin) => Promise<void>;
  register: (data: UserRegister) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from token on mount
  useEffect(() => {
    if (getToken()) {
      fetchMe()
        .then(setUser)
        .catch(() => removeToken())
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (data: UserLogin) => {
    const res = await apiLogin(data);
    setToken(res.access_token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (data: UserRegister) => {
    const res = await apiRegister(data);
    setToken(res.access_token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
