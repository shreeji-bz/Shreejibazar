export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}
