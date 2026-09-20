import { get } from './api';

export async function fetchActivities() { return get('/v1/admin/activities'); }
