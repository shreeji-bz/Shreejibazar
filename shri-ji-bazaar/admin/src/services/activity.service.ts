import { get } from './api';

export async function fetchActivities() { return get('/admin/activities'); }
