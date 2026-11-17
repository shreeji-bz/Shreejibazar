interface Action { label: string; onClick: () => void; variant?: 'primary' | 'danger' | 'secondary'; }
interface Props { actions: Action[]; }
export const TableActions = ({ actions }: Props) => (
  <div className="flex gap-2">
    {actions.map((a, i) => (
      <button key={i} onClick={a.onClick} className={`px-2 py-1 text-xs rounded ${a.variant === 'danger' ? 'bg-error/15 text-error' : 'bg-card-secondary'}`}>{a.label}</button>
    ))}
  </div>
);
