interface Props { label: string; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger'; }
export const Button = ({ label, variant = 'primary' }: Props) => (
  <button className={`px-4 py-2 rounded ${variant === 'primary' ? 'bg-blue-600 text-white' : variant === 'danger' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
    {label}
  </button>
);
