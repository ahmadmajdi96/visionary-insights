export interface AuthUser {
  id: string;
  email: string;
  username: string | null;
}

export interface Store {
  id: string;
  tenant_id: string;
  name: string;
  address: string | null;
  city: string;
  country: string;
  created_at: string;
  updated_at: string;
}

export interface PlanogramProduct {
  instanceId: string;
  skuId: string | null;
  name: string;
  facings: number;
}

export interface PlanogramShelf {
  id: string;
  label: string;
  products: PlanogramProduct[];
  widthCm: number | null;
}

export interface Planogram {
  id: string;
  tenant_id: string;
  store_id: string;
  shelf_id: string | null;
  name: string;
  description: string | null;
  status: string;
  layout: PlanogramShelf[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: AuthUser;
  stores: Store[];
  planograms: Planogram[];
}
