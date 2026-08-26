interface Props { label?: string; options: { value: string; label: string }[]; }
export const SelectInput = ({ label, options }: Props) => (
  <select className="border rounded px-2 py-1">
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);
