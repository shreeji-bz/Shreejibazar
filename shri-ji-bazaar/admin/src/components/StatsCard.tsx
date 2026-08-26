import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  color?: string;
}

export const StatsCard = ({ title, value, icon: Icon, change, color = 'text-gold-bright' }: StatsCardProps) => (
  <div className="bg-card border border-border rounded-xl p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-text-muted text-sm">{title}</p>
        <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
        {change && <p className="text-sm text-success mt-1">{change}</p>}
      </div>
      <div className={`p-3 rounded-lg bg-card-secondary ${color}`}>
        <Icon size={22} />
      </div>
    </div>
  </div>
);
