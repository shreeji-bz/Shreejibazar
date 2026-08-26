import { get, post } from './api';

export async function fetchNotifications() { return get('/admin/notifications'); }
export async function sendNotification(data: any) { return post('/admin/notifications/send', data); }
