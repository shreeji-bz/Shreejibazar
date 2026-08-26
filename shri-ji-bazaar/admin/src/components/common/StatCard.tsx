interface Props { title: string; value: string | number; }
export const StatCard = ({ title, value }: Props) => (
  <div className="bg-white p-4 rounded-lg shadow-sm">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);
