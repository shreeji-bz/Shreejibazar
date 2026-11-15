import { InputHTMLAttributes, forwardRef } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {}

export const SearchInput = forwardRef<HTMLInputElement, Props>(({ className = '', ...props }, ref) => (
  <input ref={ref} type="search" placeholder="Search..." className={`w-64 px-4 py-2.5 bg-card-secondary border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:border-gold ${className}`} {...props} />
));
