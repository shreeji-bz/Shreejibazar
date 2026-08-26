import { ResultEntity } from './result.entity';

export interface ResultsEntity {
  data: ResultEntity[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
