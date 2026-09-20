import { get, post, put } from './api';

export async function fetchRounds() { return get('/v1/admin/rounds'); }
export async function fetchRound(id: string) { return get(`/v1/admin/rounds/${id}`); }
export async function createRound(data: any) { return post('/v1/admin/rounds', data); }
export async function updateRound(id: string, data: any) { return put(`/v1/admin/rounds/${id}`, data); }
