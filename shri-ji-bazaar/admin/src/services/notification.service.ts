import { get, post } from './api';

export async function fetchNotifications() { return get('/v1/admin/notifications'); }
export async function sendNotification(data: any) { return post('/v1/admin/notifications/send', data); }
