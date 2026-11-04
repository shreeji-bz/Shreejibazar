import { get, post, del, patch } from './api';

export async function fetchBanners(): Promise<any> { return get('/v1/admin/banners'); }
export async function createBanner(data: any): Promise<any> { return post('/v1/admin/banners', data); }
export async function updateBanner(id: string, data: any): Promise<any> { return patch(`/v1/admin/banners/${id}`, data); }
export async function deleteBanner(id: string): Promise<any> { return del(`/v1/admin/banners/${id}`); }
