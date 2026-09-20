import { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: string;
  children: ReactNode;
}

export const Button = ({ variant = 'primary', size = '', children, className = '', ...props }: Props) => {
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
  };
  const base = 'rounded-lg font-medium text-sm transition-colors';
  const variants: Record<string, string> = {
    primary: 'bg-gold text-text-primary hover:bg-gold-bright',
    secondary: 'bg-card-secondary text-text-primary hover:bg-card-tertiary',
    outline: 'border border-border text-text-secondary hover:text-text-primary',
  };
  return <button className={`${base} ${size ? sizes[size] : 'px-4 py-2'} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};
