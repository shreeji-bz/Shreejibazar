import { get } from './api';

export async function fetchReferrals() { return get('/admin/referrals'); }
