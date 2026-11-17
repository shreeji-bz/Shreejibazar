interface Props { title: string; value: string | number; }
export const StatCard = ({ title, value }: Props) => (
  <div className="bg-card p-4 rounded-lg shadow-sm">
    <p className="text-sm text-text-muted">{title}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);
