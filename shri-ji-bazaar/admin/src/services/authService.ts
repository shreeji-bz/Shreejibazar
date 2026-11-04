import { post, get, patch, del, put } from './api';

// ============================================================================
// Admin API service.
//
// Every function below talks to the /admin/* endpoints (authenticateAdmin),
// because the admin panel's browser token is an admin JWT. The admin
// controllers share services with the user controllers but are NOT filtered
// by a caller's user id — so list-all (users, tickets, banners, bonuses,
// referrals, notifications) actually returns everything an admin should see.
// (Pointing these at the user-side /v1/* endpoints used to filter by the
// admin's own id, which is why Support/Referrals showed up empty.)
// ============================================================================

export const login = async (email: string, password: string) => {
  return post('/v1/admin/auth/login', { email, password });
};

export const loginAdmin = async (data: { email: string; password: string }) => {
  return post('/v1/admin/auth/login', data);
};

export const getDashboard = async () => {
  return get('/v1/admin/dashboard');
};

export const getAuditLogs = async (params?: any) => {
  return get('/v1/admin/audit-logs', params ? { params } : undefined);
};

// ---- Users ----
export const getUsers = async (params: any) => {
  return get('/v1/admin/users', params);
};

export const updateUser = async (id: string, data: any) => {
  return patch(`/v1/admin/users/${id}`, data);
};

export const updateUserStatus = async (id: string, status: string) => {
  return patch(`/v1/admin/users/${id}/status`, { status });
};

// ---- Games (legacy menu still calls these; admin endpoints) ----
export const getGames = async (params: any) => {
  return get('/v1/admin/games', { params });
};

export const createGame = async (data: any) => {
  return post('/v1/admin/games', data);
};

export const updateGame = async (id: string, data: any) => {
  return patch(`/v1/admin/games/${id}`, data);
};

export const deleteGame = async (id: string) => {
  return del(`/v1/admin/games/${id}`);
};

// ---- Rounds (admin router: /close + /result are registered) ----
export const getRounds = async (params: any) => {
  return get('/v1/admin/rounds/game/' + params.gameId, { params });
};

export const closeRound = async (id: string) => {
  return post('/v1/admin/rounds/' + id + '/close', {});
};

export const declareResult = async (id: string, result: string) => {
  return post('/v1/admin/rounds/' + id + '/result', { result });
};

// ---- Banners ----
export const getBanners = async () => {
  return get('/v1/admin/banners');
};

export const createBanner = async (data: any) => {
  return post('/v1/admin/banners', data);
};

export const updateBanner = async (id: string, data: any) => {
  return patch(`/v1/admin/banners/${id}`, data);
};

export const deleteBanner = async (id: string) => {
  return del(`/v1/admin/banners/${id}`);
};

// ---- Bonuses ----
export const getBonuses = async () => {
  return get('/v1/admin/bonuses');
};

export const createBonus = async (data: any) => {
  return post('/v1/admin/bonuses', data);
};

export const updateBonus = async (id: string, data: any) => {
  return patch(`/v1/admin/bonuses/${id}`, data);
};

// ---- Results (public read endpoint, no auth needed) ----
export const getResults = async (params: any) => {
  return get('/v1/results/latest', { params });
};

// ---- Referrals (admin router returns full list with meta) ----
export const getReferrals = async (params: any) => {
  return get('/v1/admin/referrals', { params });
};

// ---- Support (admin router lists ALL tickets, not just the caller's) ----
export const getSupportTickets = async () => {
  return get('/v1/admin/support/tickets');
};

export const updateTicket = async (id: string, data: any) => {
  return patch(`/v1/admin/support/tickets/${id}`, data);
};

// ---- Settings (admin router: PUT /:key and PUT / batch) ----
export const getSettings = async () => {
  return get('/v1/admin/settings');
};

export const updateSetting = async (key: string, value: string) => {
  return put(`/v1/admin/settings/${key}`, { value });
};

// ---- Notifications (admin router: POST /send, target defaults to 'all') ----
export const getNotifications = async (params: any) => {
  return get('/v1/admin/notifications', { params });
};

export const createNotification = async (data: any) => {
  return post('/v1/admin/notifications/send', { target: 'all', ...data });
};
