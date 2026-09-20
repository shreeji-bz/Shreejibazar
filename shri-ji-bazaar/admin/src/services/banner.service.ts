import { get, post, put, del } from './api';

export async function fetchBanners() { return get('/v1/admin/banners'); }
export async function createBanner(data: any) { return post('/v1/admin/banners', data); }
export async function updateBanner(id: string, data: any) { return put(`/v1/admin/banners/${id}`, data); }
export async function deleteBanner(id: string) { return del(`/v1/admin/banners/${id}`); }
