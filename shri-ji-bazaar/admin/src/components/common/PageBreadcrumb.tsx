interface Props { items: { label: string; href?: string }[] }
export const PageBreadcrumb = ({ items }: Props) => <nav className="text-sm text-gray-500">{items.map(i => i.label).join(' > ')}</nav>;
