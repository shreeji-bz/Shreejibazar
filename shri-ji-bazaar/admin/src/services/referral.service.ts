import { get } from './api';

export async function fetchReferrals() { return get('/v1/admin/referrals'); }
