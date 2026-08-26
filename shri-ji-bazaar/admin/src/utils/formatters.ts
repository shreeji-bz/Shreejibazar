export function formatNumber(num: number): string {
  return num.toLocaleString('en-IN');
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-IN');
}
