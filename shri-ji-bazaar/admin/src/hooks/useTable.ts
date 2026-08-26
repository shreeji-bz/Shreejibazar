import { useState } from 'react';

export function useTable<T>(initialData: T[] = []) {
  const [data, setData] = useState<T[]>(initialData);
  const [page, setPage] = useState(1);
  return { data, setData, page, setPage };
}
