import { get, post } from './api';

export async function fetchResults() { return get('/v1/admin/results'); }
export async function declareResult(data: any) { return post('/v1/admin/results/declare', data); }
