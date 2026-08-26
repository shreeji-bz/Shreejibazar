export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'admin' | 'super_admin';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Game {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  openingTime: string;
  closingTime: string;
  resultTime: string;
  status: string;
  isPopular: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Round {
  id: string;
  gameId: string;
  gameName: string;
  roundNumber: number;
  startTime: string;
  endTime: string;
  status: 'pending' | 'open' | 'closed' | 'result_declared';
  result?: string;
  createdAt: string;
}

export interface Result {
  id: string;
  roundId: string;
  gameId: string;
  gameName: string;
  roundNumber: number;
  result: string;
  declaredAt: string;
}

export interface Banner {
  id: string;
  title: string;
  image: string;
  description: string;
  action: string;
  actionValue: string;
  sortOrder: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  target: 'all' | 'specific';
  targetUsers?: string[];
  sentAt: string;
  createdAt: string;
}
