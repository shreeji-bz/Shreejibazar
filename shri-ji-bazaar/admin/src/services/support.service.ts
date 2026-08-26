import { get, post } from './api';

export async function fetchTickets() { return get('/admin/support/tickets'); }
export async function fetchTicket(id: string) { return get(`/admin/support/tickets/${id}`); }
export async function replyToTicket(id: string, data: any) { return post(`/admin/support/tickets/${id}/reply`, data); }
