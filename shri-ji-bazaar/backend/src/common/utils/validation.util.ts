import { ValidationError } from '../types/common.types';

export function validateRequired(data: Record<string, any>, fields: string[]): ValidationError | null {
  for (const field of fields) {
    if (!data[field]) return { field, message: `${field} is required` };
  }
  return null;
}
