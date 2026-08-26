import { InputHTMLAttributes, forwardRef } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, Props>(({ className = '', ...props }, ref) => (
  <input ref={ref} className={`w-full px-4 py-2.5 bg-card-secondary border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:border-gold ${className}`} {...props} />
));
