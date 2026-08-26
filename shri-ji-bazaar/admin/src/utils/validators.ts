export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile);
}

export function validateRequired(value: any): boolean {
  return value !== null && value !== undefined && String(value).trim() !== '';
}
