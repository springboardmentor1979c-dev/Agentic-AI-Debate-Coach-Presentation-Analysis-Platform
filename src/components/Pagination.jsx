import React from 'react';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`h-9 w-9 text-sm font-semibold rounded-xl flex items-center justify-center transition-all ${
            currentPage === i
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
              : 'hover:bg-slate-100 dark:hover:bg-darkbg-accent text-slate-600 dark:text-slate-350'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className={`flex items-center justify-between px-4 py-3 border-t border-slate-150 dark:border-darkbg-border ${className}`}>
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="relative inline-flex items-center px-4 py-2 text-xs font-semibold rounded-xl text-slate-750 bg-white dark:bg-darkbg-card border border-slate-200 dark:border-darkbg-border disabled:opacity-50"
        >
          Previous
        </button>
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="relative ml-3 inline-flex items-center px-4 py-2 text-xs font-semibold rounded-xl text-slate-750 bg-white dark:bg-darkbg-card border border-slate-200 dark:border-darkbg-border disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing Page <span className="font-semibold text-slate-800 dark:text-slate-200">{currentPage}</span> of{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="inline-flex items-center space-x-1.5" aria-label="Pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="h-9 w-9 rounded-xl border border-slate-250 dark:border-darkbg-border flex items-center justify-center text-slate-550 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-darkbg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <IoChevronBack className="h-4 w-4" />
            </button>
            {renderPageNumbers()}
            <button
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="h-9 w-9 rounded-xl border border-slate-250 dark:border-darkbg-border flex items-center justify-center text-slate-550 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-darkbg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <IoChevronForward className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
