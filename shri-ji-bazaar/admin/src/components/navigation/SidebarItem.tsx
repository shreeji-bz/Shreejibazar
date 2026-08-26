interface Props { label: string; icon?: string; href?: string; active?: boolean; }
export const SidebarItem = ({ label, active = false }: Props) => (
  <div className={`px-4 py-2 ${active ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>{label}</div>
);
