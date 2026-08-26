import { get, post, put } from './api';

export async function fetchRounds() { return get('/admin/rounds'); }
export async function fetchRound(id: string) { return get(`/admin/rounds/${id}`); }
export async function createRound(data: any) { return post('/admin/rounds', data); }
export async function updateRound(id: string, data: any) { return put(`/admin/rounds/${id}`, data); }
