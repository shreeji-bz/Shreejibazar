import { get, post, patch } from './api';

export async function fetchNotifications() { return get('/v1/admin/notifications'); }
export async function sendNotification(data: any) { return post('/v1/admin/notifications/send', data); }
export async function markAllRead() { return patch('/v1/admin/notifications/mark-all-read', {}); }
