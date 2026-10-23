import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

const getPageItems = (currentPage, totalPages) => {
  if (totalPages <= 15) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const start = Math.max(2, currentPage - 2);
  const end = Math.min(totalPages - 1, currentPage + 2);
  const pages = [1];

  if (start > 2) pages.push('start-ellipsis');
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < totalPages - 1) pages.push('end-ellipsis');
  pages.push(totalPages);

  return pages;
};

export default function Pagination({ page, totalPages, onPageChange, label = 'Pagination', compact = false }) {
  if (totalPages <= 1) return null;

  if (compact) {
    return (
      <nav className="border-t border-[#bedef6]/70 px-3 py-4" aria-label={label}>
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="w-8 h-8 rounded-lg bg-white border border-[#bedef6]/50 text-[#112d68] hover:bg-[#bedef6] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-[#040f36] px-2" aria-live="polite">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="w-8 h-8 rounded-lg bg-white border border-[#bedef6]/50 text-[#112d68] hover:bg-[#bedef6] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            aria-label="Next page"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </nav>
    );
  }

  const pageItems = getPageItems(page, totalPages);

  const buttonClass = 'h-10 min-w-9 px-2.5 rounded-lg text-sm font-semibold transition-colors disabled:cursor-not-allowed';

  return (
    <nav className="border-t border-[#bedef6]/70 px-3 py-4" aria-label={label}>
      <div className="hidden w-full overflow-x-auto mobile-pagination-scroll sm:block">
        <div className="flex w-max min-w-full items-center justify-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className={`${buttonClass} border border-[#bedef6]/70 ${page === 1 ? 'bg-[#f3f4f6] text-gray-400' : 'bg-white text-[#112d68] hover:bg-[#bedef6]/40'}`}
            aria-label="Previous page"
          >
            Previous
          </button>

          {pageItems.map((item) => (
            typeof item === 'number' ? (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-label={`Page ${item}`}
                aria-current={page === item ? 'page' : undefined}
                className={`${buttonClass} ${page === item ? 'bg-[#112d68] text-white' : 'bg-transparent text-[#112d68] hover:bg-[#bedef6]/40'}`}
              >
                {item}
              </button>
            ) : (
              <span key={item} className="px-1 text-sm text-[#8fa6b9]" aria-hidden="true">…</span>
            )
          ))}

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className={`${buttonClass} border border-[#bedef6]/70 ${page === totalPages ? 'bg-[#f3f4f6] text-gray-400' : 'bg-white text-[#112d68] hover:bg-[#bedef6]/40'}`}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:hidden">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={`${buttonClass} border border-[#bedef6]/70 ${page === 1 ? 'bg-[#f3f4f6] text-gray-400' : 'bg-white text-[#112d68] hover:bg-[#bedef6]/40'}`}
          aria-label="Previous page"
        >
          Previous
        </button>
        <span className="whitespace-nowrap text-sm font-semibold text-[#040f36]" aria-live="polite">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={`${buttonClass} border border-[#bedef6]/70 ${page === totalPages ? 'bg-[#f3f4f6] text-gray-400' : 'bg-white text-[#112d68] hover:bg-[#bedef6]/40'}`}
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </nav>
  );
}
