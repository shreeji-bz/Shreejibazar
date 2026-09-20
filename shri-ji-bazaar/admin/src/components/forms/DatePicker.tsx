export const DatePicker = ({ label }: { label?: string }) => (
  <div>
    {label && <label className="block text-xs text-text-muted mb-1">{label}</label>}
    <input type="date" className="border border-border rounded px-2 py-1 bg-card-secondary text-text-primary text-sm" />
  </div>
);
