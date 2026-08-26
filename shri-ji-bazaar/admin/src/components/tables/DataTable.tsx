interface Column<T> { header: string; accessor: keyof T | string; }
interface Props<T> { columns: Column<T>[]; data: T[]; }
export function DataTable<T>({ columns, data }: Props<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            {columns.map(c => <th key={String(c.accessor)} className="text-left px-4 py-2">{c.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t">
              {columns.map(c => <td key={String(c.accessor)} className="px-4 py-2">{String(row[c.accessor as keyof T] ?? '')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
