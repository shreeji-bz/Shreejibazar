import { SelectHTMLAttributes, forwardRef } from 'react';

interface Option { value: string; label: string; }
interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
}

export const SelectInput = forwardRef<HTMLSelectElement, Props>(({ label, options, className = '', ...props }, ref) => (
  <div>
    {label && <label className="block text-sm text-text-secondary mb-1">{label}</label>}
    <select ref={ref} className={`w-full px-4 py-2.5 bg-card-secondary border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:border-gold ${className}`} {...props}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
));
