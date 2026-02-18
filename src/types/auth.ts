export interface AuthUser {
  id: string;
  email: string;
  username: string;
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

export interface PlanogramSlot {
  slot: number;
  label: string;
}

export interface Planogram {
  id: string;
  tenant_id: string;
  store_id: string;
  shelf_id: string;
  name: string;
  description: string | null;
  status: string;
  layout: PlanogramSlot[];
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
