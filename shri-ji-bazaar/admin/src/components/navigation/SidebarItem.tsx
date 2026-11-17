interface Props { label: string; icon?: string; href?: string; active?: boolean; }
export const SidebarItem = ({ label, active = false }: Props) => (
  <div className={`px-4 py-2 ${active ? 'bg-gold' : 'hover:bg-gold-dark'}`}>{label}</div>
);
