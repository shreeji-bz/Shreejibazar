const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function getAuthHeaders(): Record<string, string> {
  try {
    const raw = localStorage.getItem('admin-auth');
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const token = parsed?.token || parsed?.state?.token;
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
}

function buildUrl(path: string, params?: Record<string, any>): string {
  const base = `${API_BASE}${path}`;
  if (!params) return base;

  // Support both wrapped `{ params: {...} }` and direct query params
  const source = params.params && typeof params.params === 'object' && Object.keys(params).length === 1
    ? params.params
    : params;

  const searchParams = new URLSearchParams();
  Object.entries(source).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `${base}?${query}` : base;
}

export async function get<T>(path: string, params?: Record<string, any>): Promise<T> {
  const res = await fetch(buildUrl(path, params), { headers: getAuthHeaders() });
  return (await res.json()) as T;
}

export async function post<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, body: JSON.stringify(body) });
  return (await res.json()) as T;
}

export async function put<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, body: JSON.stringify(body) });
  return (await res.json()) as T;
}

export async function del<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE', headers: getAuthHeaders() });
  return (await res.json()) as T;
}

export async function patch<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, body: JSON.stringify(body) });
  return (await res.json()) as T;
}
