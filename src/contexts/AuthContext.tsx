import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AuthUser, Store, Planogram, LoginResponse } from '@/types/auth';

// Dummy data matching the API response structure
const DUMMY_LOGIN_RESPONSE: LoginResponse = {
  access_token: "dummy-token",
  refresh_token: "dummy-refresh",
  expires_in: 86400,
  token_type: "bearer",
  user: {
    id: "1a687fd0-3989-48a4-800f-21986c0cb63a",
    email: "demo@example.com",
    username: "demo_user",
  },
  stores: [
    {
      id: "store-1",
      tenant_id: "tenant-1",
      name: "Downtown Supermarket",
      address: "123 Main St",
      city: "Cairo",
      country: "EG",
      created_at: "2026-01-15T10:00:00Z",
      updated_at: "2026-01-15T10:00:00Z",
    },
    {
      id: "store-2",
      tenant_id: "tenant-1",
      name: "Mall Branch",
      address: "456 Mall Ave",
      city: "Alexandria",
      country: "EG",
      created_at: "2026-02-01T10:00:00Z",
      updated_at: "2026-02-01T10:00:00Z",
    },
    {
      id: "store-3",
      tenant_id: "tenant-1",
      name: "Airport Convenience",
      address: null,
      city: "Giza",
      country: "EG",
      created_at: "2026-02-10T10:00:00Z",
      updated_at: "2026-02-10T10:00:00Z",
    },
  ],
  planograms: [
    {
      id: "plano-1",
      tenant_id: "tenant-1",
      store_id: "store-1",
      shelf_id: "shelf-1",
      name: "Beverages Aisle A",
      description: "Main beverage display",
      status: "active",
      layout: [{ slot: 1, label: "SKU-A" }, { slot: 2, label: "SKU-B" }],
      created_by: null,
      created_at: "2026-01-20T10:00:00Z",
      updated_at: "2026-01-20T10:00:00Z",
    },
    {
      id: "plano-2",
      tenant_id: "tenant-1",
      store_id: "store-1",
      shelf_id: "shelf-2",
      name: "Snacks Section B",
      description: null,
      status: "active",
      layout: [{ slot: 1, label: "SKU-C" }],
      created_by: null,
      created_at: "2026-01-25T10:00:00Z",
      updated_at: "2026-01-25T10:00:00Z",
    },
    {
      id: "plano-3",
      tenant_id: "tenant-1",
      store_id: "store-2",
      shelf_id: "shelf-3",
      name: "Dairy Cooler",
      description: "Refrigerated dairy section",
      status: "active",
      layout: [{ slot: 1, label: "SKU-D" }, { slot: 2, label: "SKU-E" }, { slot: 3, label: "SKU-F" }],
      created_by: null,
      created_at: "2026-02-05T10:00:00Z",
      updated_at: "2026-02-05T10:00:00Z",
    },
    {
      id: "plano-4",
      tenant_id: "tenant-1",
      store_id: "store-3",
      shelf_id: "shelf-4",
      name: "Travel Essentials",
      description: null,
      status: "active",
      layout: [{ slot: 1, label: "SKU-G" }],
      created_by: null,
      created_at: "2026-02-12T10:00:00Z",
      updated_at: "2026-02-12T10:00:00Z",
    },
  ],
};

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

  const login = useCallback(async (_email: string, _password: string) => {
    // TODO: Replace with actual API call
    // For now, use dummy data
    await new Promise((resolve) => setTimeout(resolve, 800)); // simulate network
    const data = DUMMY_LOGIN_RESPONSE;
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
