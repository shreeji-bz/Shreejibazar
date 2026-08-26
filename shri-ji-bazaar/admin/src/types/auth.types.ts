export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  admin: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}
