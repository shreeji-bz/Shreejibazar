import { get, post, put } from './api';

export async function fetchBonuses() { return get('/admin/bonuses'); }
export async function createBonus(data: any) { return post('/admin/bonuses', data); }
export async function updateBonus(id: string, data: any) { return put(`/admin/bonuses/${id}`, data); }
