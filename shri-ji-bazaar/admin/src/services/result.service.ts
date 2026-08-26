import { get, post } from './api';

export async function fetchResults() { return get('/admin/results'); }
export async function declareResult(data: any) { return post('/admin/results/declare', data); }
