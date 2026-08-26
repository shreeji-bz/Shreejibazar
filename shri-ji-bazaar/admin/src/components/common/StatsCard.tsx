import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
}

export const AdminStatsCard = ({ title, value, icon: Icon, change }: Props) => (
  <div className="bg-card border border-border rounded-xl p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-text-muted text-sm">{title}</p>
        <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
        {change && <p className="text-sm text-success mt-1">{change}</p>}
      </div>
      <div className="p-2.5 rounded-lg bg-card-secondary text-gold-bright"><Icon size={20} /></div>
    </div>
  </div>
);
