interface Props { currentPage: number; totalPages: number; onPageChange: (p: number) => void; }
export const Pagination = ({ currentPage, totalPages, onPageChange }: Props) => (
  <div className="flex gap-2 justify-center py-4">
    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
      <button key={p} onClick={() => onPageChange(p)} className={`px-3 py-1 rounded ${p === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>{p}</button>
    ))}
  </div>
);
