import { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  children: ReactNode;
}

export const Button = ({ variant = 'primary', children, className = '', ...props }: Props) => {
  const base = 'px-4 py-2 rounded-lg font-medium text-sm transition-colors';
  const variants: Record<string, string> = {
    primary: 'bg-gold text-text-primary hover:bg-gold-bright',
    secondary: 'bg-card-secondary text-text-primary hover:bg-card-tertiary',
    outline: 'border border-border text-text-secondary hover:text-text-primary',
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};
