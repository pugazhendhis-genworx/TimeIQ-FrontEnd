import Button from './Button';

interface PaginationProps {
  page: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  /** Max page buttons to show (excluding prev/next). */
  maxButtons?: number;
}

const Pagination = ({
  page,
  totalItems,
  pageSize = 10,
  onPageChange,
  maxButtons = 5,
}: PaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const clamp = (p: number) => Math.min(totalPages, Math.max(1, p));
  const goTo = (p: number) => onPageChange(clamp(p));

  const half = Math.floor(maxButtons / 2);
  const start = Math.max(1, page - half);
  const end = Math.min(totalPages, start + maxButtons - 1);

  const effectiveStart = Math.max(1, end - maxButtons + 1);

  const pageButtons = [];
  for (let p = effectiveStart; p <= end; p += 1) {
    pageButtons.push(p);
  }

  return (
    <div className="pagination">
      <div className="pagination__meta">
        Page <strong>{page}</strong> of <strong>{totalPages}</strong>
      </div>

      <div className="pagination__controls">
        <Button
          variant="ghost"
          className="btn--sm"
          disabled={page <= 1}
          onClick={() => goTo(page - 1)}
        >
          Prev
        </Button>

        {pageButtons.map((p) => (
          <Button
            key={p}
            variant={p === page ? 'primary' : 'ghost'}
            className="btn--sm pagination__btn"
            onClick={() => goTo(p)}
          >
            {p}
          </Button>
        ))}

        <Button
          variant="ghost"
          className="btn--sm"
          disabled={page >= totalPages}
          onClick={() => goTo(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;

