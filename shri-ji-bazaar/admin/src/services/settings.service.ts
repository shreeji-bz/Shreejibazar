import { get, put } from './api';

export async function fetchSettings() { return get('/admin/settings'); }
export async function updateSettings(data: any) { return put('/admin/settings', data); }
