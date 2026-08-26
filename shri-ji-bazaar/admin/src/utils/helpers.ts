export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString();
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

export function generateSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
