interface Props { label?: string; type?: string; placeholder?: string; }
export const TextInput = ({ label, type = 'text', placeholder }: Props) => (
  <div>
    {label && <label className="block text-sm text-gray-600">{label}</label>}
    <input type={type} placeholder={placeholder} className="border rounded px-3 py-1 w-full" />
  </div>
);
