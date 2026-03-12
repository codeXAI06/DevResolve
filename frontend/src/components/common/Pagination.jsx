import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(0, page - 2);
  const end = Math.min(totalPages - 1, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <button
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        className="p-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {start > 0 && (
        <>
          <PageBtn num={0} current={page} onClick={onPageChange} />
          {start > 1 && <span className="px-2 text-gray-600">...</span>}
        </>
      )}

      {pages.map((p) => (
        <PageBtn key={p} num={p} current={page} onClick={onPageChange} />
      ))}

      {end < totalPages - 1 && (
        <>
          {end < totalPages - 2 && <span className="px-2 text-gray-600">...</span>}
          <PageBtn num={totalPages - 1} current={page} onClick={onPageChange} />
        </>
      )}

      <button
        disabled={page === totalPages - 1}
        onClick={() => onPageChange(page + 1)}
        className="p-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

function PageBtn({ num, current, onClick }) {
  const active = num === current;
  return (
    <button
      onClick={() => onClick(num)}
      className={`min-w-[40px] h-10 rounded-lg text-base font-medium transition-colors
        ${active ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
    >
      {num + 1}
    </button>
  );
}
