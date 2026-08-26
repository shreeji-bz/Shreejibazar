import { get, post } from './api';

export async function fetchPoints() { return get('/admin/points'); }
export async function adjustPoints(data: any) { return post('/admin/points/adjust', data); }
