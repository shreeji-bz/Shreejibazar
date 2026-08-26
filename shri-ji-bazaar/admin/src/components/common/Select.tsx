import { SelectHTMLAttributes, forwardRef } from 'react';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, Props>(({ label, children, className = '', ...props }, ref) => (
  <div>
    {label && <label className="block text-sm text-text-secondary mb-1.5">{label}</label>}
    <select ref={ref} className={`w-full px-4 py-2.5 bg-card-secondary border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:border-gold ${className}`} {...props}>
      {children}
    </select>
  </div>
));
