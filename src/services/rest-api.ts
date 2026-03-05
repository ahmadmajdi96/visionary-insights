import { getApiHost } from './api';

/**
 * Authenticated REST API client for /rest/v1/{resource}
 * Mirrors the Supabase-style PostgREST API exposed by the backend.
 */

function getRestBaseUrl(): string {
  return `${getApiHost()}/rest/v1`;
}

interface RestQueryOptions {
  select?: string;
  filters?: Record<string, string>;
  order?: string;
  limit?: number;
  offset?: number;
}

export async function restQuery<T = any>(
  resource: string,
  accessToken: string,
  options: RestQueryOptions = {}
): Promise<T[]> {
  const url = new URL(`${getRestBaseUrl()}/${resource}`);

  if (options.select) url.searchParams.set('select', options.select);
  if (options.order) url.searchParams.set('order', options.order);
  if (options.limit) url.searchParams.set('limit', options.limit.toString());
  if (options.offset) url.searchParams.set('offset', options.offset.toString());

  if (options.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error(`REST API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ----- Typed resource fetchers -----

export interface SKU {
  id: string;
  tenant_id: string;
  name: string;
  barcode?: string | null;
  category?: string | null;
  brand?: string | null;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchSKUs(accessToken: string, tenantId?: string): Promise<SKU[]> {
  const filters: Record<string, string> = {};
  if (tenantId) filters['tenant_id'] = `eq.${tenantId}`;
  return restQuery<SKU>('skus', accessToken, { select: '*', filters });
}

export async function fetchPlanograms(accessToken: string, storeId?: string) {
  const filters: Record<string, string> = {};
  if (storeId) filters['store_id'] = `eq.${storeId}`;
  return restQuery('planograms', accessToken, { select: '*', filters });
}

export async function fetchStores(accessToken: string, tenantId?: string) {
  const filters: Record<string, string> = {};
  if (tenantId) filters['tenant_id'] = `eq.${tenantId}`;
  return restQuery('stores', accessToken, { select: '*', filters });
}

/**
 * Call an RPC function on the backend
 */
export async function restRpc<T = any>(
  fnName: string,
  accessToken: string,
  body: Record<string, any> = {}
): Promise<T> {
  const response = await fetch(`${getRestBaseUrl()}/rpc/${fnName}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error(`RPC error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
