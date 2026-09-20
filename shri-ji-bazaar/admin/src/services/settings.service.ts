import { get, put } from './api';

export async function fetchSettings() { return get('/v1/admin/settings'); }
export async function updateSettings(data: any) { return put('/v1/admin/settings', data); }
