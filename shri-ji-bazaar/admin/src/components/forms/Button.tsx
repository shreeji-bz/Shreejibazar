import { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: ReactNode;
}

export const Button = ({ variant = 'primary', children, className = '', ...props }: Props) => {
  const variants: Record<string, string> = {
    primary: 'bg-gold text-text-primary hover:bg-gold-bright',
    secondary: 'bg-card-secondary text-text-primary hover:bg-card-tertiary',
    danger: 'bg-error text-white hover:bg-error/90',
  };
  return <button className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${variants[variant]} ${className}`} {...props}>{children}</button>;
};
