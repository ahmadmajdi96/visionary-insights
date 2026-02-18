import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AuthUser, Store, Planogram, LoginResponse } from '@/types/auth';
import { getApiHost } from '@/services/api';

interface AuthContextType {
  user: AuthUser | null;
  stores: Store[];
  planograms: Planogram[];
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getStorePlanograms: (storeId: string) => Planogram[];
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [planograms, setPlanograms] = useState<Planogram[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${getApiHost()}/auth/v1/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Login failed');
    }

    const data: LoginResponse = await res.json();
    setUser(data.user);
    setStores(data.stores);
    setPlanograms(data.planograms);
    setAccessToken(data.access_token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setStores([]);
    setPlanograms([]);
    setAccessToken(null);
  }, []);

  const getStorePlanograms = useCallback(
    (storeId: string) => planograms.filter((p) => p.store_id === storeId),
    [planograms]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        stores,
        planograms,
        accessToken,
        isAuthenticated: !!user,
        login,
        logout,
        getStorePlanograms,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
