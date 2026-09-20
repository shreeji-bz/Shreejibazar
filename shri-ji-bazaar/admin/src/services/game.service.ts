import { get, post, put, del, patch } from './api';

export async function fetchGames() { return get('/v1/admin/games'); }
export async function fetchGame(id: string) { return get(`/v1/admin/games/${id}`); }
export async function createGame(data: any) { return post('/v1/admin/games', data); }
export async function updateGame(id: string, data: any) { return put(`/v1/admin/games/${id}`, data); }
export async function deleteGame(id: string) { return del(`/v1/admin/games/${id}`); }
export async function toggleGameStatus(id: string, status: string) {
  return patch(`/v1/admin/games/${id}/status`, { status });
}
