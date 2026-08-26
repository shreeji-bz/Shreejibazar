import { Game } from './common.types';

export interface CreateGameRequest {
  name: string;
  description: string;
  openingTime: string;
  closingTime: string;
  resultTime: string;
  isPopular?: boolean;
  sortOrder?: number;
}

export interface UpdateGameRequest extends Partial<CreateGameRequest> {
  status?: string;
}
