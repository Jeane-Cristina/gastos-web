import "./Pagination.css";

interface Props {
  page: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalCount, pageSize, onPageChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        ← Anterior
      </button>
      <span>Página {page} de {totalPages}</span>
      <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Próxima →
      </button>
    </div>
  );
}