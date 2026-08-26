export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    mobile: string;
    email: string;
    avatar?: string;
    referralCode: string;
  };
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}
