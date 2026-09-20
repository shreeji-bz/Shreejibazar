import { post, get, patch, del, put } from './api';

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

export const getUsers = async (params: any) => {
  return get('/v1/users', { params });
};

export const updateUser = async (id: string, data: any) => {
  return patch(`/v1/users/${id}`, data);
};

export const updateUserStatus = async (id: string, status: string) => {
  return patch(`/v1/users/${id}/status`, { status });
};

export const getGames = async (params: any) => {
  return get('/v1/games', { params });
};

export const createGame = async (data: any) => {
  return post('/v1/games', data);
};

export const updateGame = async (id: string, data: any) => {
  return patch(`/v1/games/${id}`, data);
};

export const deleteGame = async (id: string) => {
  return del(`/v1/games/${id}`);
};

export const getRounds = async (params: any) => {
  return get('/v1/rounds/game/' + params.gameId, { params });
};

export const closeRound = async (id: string) => {
  return post('/v1/rounds/' + id + '/close', {});
};

export const declareResult = async (id: string, result: string) => {
  return post('/v1/rounds/' + id + '/result', { result });
};

export const getBanners = async () => {
  return get('/v1/banners');
};

export const createBanner = async (data: any) => {
  return post('/v1/banners', data);
};

export const updateBanner = async (id: string, data: any) => {
  return patch(`/v1/banners/${id}`, data);
};

export const deleteBanner = async (id: string) => {
  return del(`/v1/banners/${id}`);
};

export const getBonuses = async () => {
  return get('/v1/bonuses');
};

export const createBonus = async (data: any) => {
  return post('/v1/bonuses', data);
};

export const updateBonus = async (id: string, data: any) => {
  return patch(`/v1/bonuses/${id}`, data);
};

export const getResults = async (params: any) => {
  return get('/v1/results/latest', { params });
};

export const getReferrals = async (params: any) => {
  return get('/v1/referrals', { params });
};

export const getSupportTickets = async () => {
  return get('/v1/support');
};

export const updateTicket = async (id: string, data: any) => {
  return patch(`/v1/support/${id}`, data);
};

export const getSettings = async () => {
  return get('/v1/settings');
};

export const updateSetting = async (key: string, value: string) => {
  return put(`/v1/settings/${key}`, { value });
};

export const getNotifications = async (params: any) => {
  return get('/v1/notifications', { params });
};

export const createNotification = async (data: any) => {
  return post('/v1/notifications', data);
};
