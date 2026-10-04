import { useMemo, useState } from 'react';

export function usePagination(items, pageSize = 10) {
  const [page, setPage] = useState(1);

  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount); // never past the last page if the list shrinks

  const pageItems = useMemo(
    () => items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [items, currentPage, pageSize],
  );

  return { page: currentPage, setPage, pageItems, total, pageSize, pageCount };
}