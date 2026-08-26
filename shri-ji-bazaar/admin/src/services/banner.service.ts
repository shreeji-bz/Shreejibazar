import { get, post, put, del } from './api';

export async function fetchBanners() { return get('/admin/banners'); }
export async function createBanner(data: any) { return post('/admin/banners', data); }
export async function updateBanner(id: string, data: any) { return put(`/admin/banners/${id}`, data); }
export async function deleteBanner(id: string) { return del(`/admin/banners/${id}`); }
