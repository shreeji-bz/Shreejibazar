import { get, post } from './api';

export async function fetchTickets() { return get('/v1/admin/support/tickets'); }
export async function fetchTicket(id: string) { return get(`/v1/admin/support/tickets/${id}`); }
export async function replyToTicket(id: string, data: any) { return post(`/v1/admin/support/tickets/${id}/reply`, data); }
