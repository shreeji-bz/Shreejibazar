import { InputHTMLAttributes, forwardRef } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(({ label, className = '', ...props }, ref) => (
  <>
    {label && <label className="block text-sm text-text-secondary mb-1">{label}</label>}
    <input ref={ref} className={`w-full px-4 py-2.5 bg-card-secondary border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:border-gold ${className}`} {...props} />
  </>
));
