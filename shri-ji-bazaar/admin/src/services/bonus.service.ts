import { get, post, put } from './api';

export async function fetchBonuses() { return get('/v1/admin/bonuses'); }
export async function createBonus(data: any) { return post('/v1/admin/bonuses', data); }
export async function updateBonus(id: string, data: any) { return put(`/v1/admin/bonuses/${id}`, data); }
