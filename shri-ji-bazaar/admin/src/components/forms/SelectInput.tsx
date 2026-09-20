interface Props { label?: string; options: { value: string; label: string }[]; }
export const SelectInput = ({ label, options }: Props) => (
  <div>
    {label && <label className="block text-xs text-text-muted mb-1">{label}</label>}
    <select className="border border-border rounded px-2 py-1 bg-card-secondary text-text-primary text-sm">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);
