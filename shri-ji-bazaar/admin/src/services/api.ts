const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function buildUrl(path: string, params?: Record<string, any>): string {
  if (!params) return `${API_BASE}${path}`;
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `${API_BASE}${path}?${query}` : `${API_BASE}${path}`;
}

export async function get<T>(path: string, params?: Record<string, any>): Promise<T> {
  const res = await fetch(buildUrl(path, params));
  return (await res.json()) as T;
}

export async function post<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return (await res.json()) as T;
}

export async function put<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return (await res.json()) as T;
}

export async function del<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE' });
  return (await res.json()) as T;
}

export async function patch<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return (await res.json()) as T;
}
