import { get, post } from './api';

export async function fetchPoints() { return get('/v1/admin/points'); }
export async function adjustPoints(data: any) { return post('/v1/admin/points/adjust', data); }
