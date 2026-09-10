import { get, post, put, del, patch } from './api';

export async function fetchGames() { return get('/admin/games'); }
export async function fetchGame(id: string) { return get(`/admin/games/${id}`); }
export async function createGame(data: any) { return post('/admin/games', data); }
export async function updateGame(id: string, data: any) { return put(`/admin/games/${id}`, data); }
export async function deleteGame(id: string) { return del(`/admin/games/${id}`); }
export async function toggleGameStatus(id: string, status: string) {
  return patch(`/admin/games/${id}/status`, { status });
}
