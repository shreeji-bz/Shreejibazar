import { ReactNode } from 'react';

interface TableProps {
  headers: string[];
  children: ReactNode;
  className?: string;
}

export const Table = ({ headers, children, className = '' }: TableProps) => (
  <div className={`overflow-x-auto rounded-xl border border-border ${className}`}>
    <table className="w-full text-sm">
      <thead className="bg-card-secondary">
        <tr>{headers.map((h, i) => <th key={i} className="px-4 py-3 text-left text-text-muted font-medium">{h}</th>)}</tr>
      </thead>
      <tbody className="divide-y divide-border">{children}</tbody>
    </table>
  </div>
);

export const TableRow = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <tr className={`hover:bg-card-secondary/50 transition-colors ${className}`}>{children}</tr>
);

export const TableCell = ({ children, className = '', colSpan }: { children: ReactNode; className?: string; colSpan?: number }) => (
  <td colSpan={colSpan} className={`px-4 py-3 text-text-secondary ${className}`}>{children}</td>
);
