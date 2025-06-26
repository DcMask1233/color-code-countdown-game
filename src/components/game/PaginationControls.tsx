
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  onNextPage?: () => void;
  onPrevPage?: () => void;
  onFirstPage?: () => void;
  onLastPage?: () => void;
}

export const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  startIndex,
  endIndex,
  totalItems,
  onNextPage,
  onPrevPage,
  onFirstPage,
  onLastPage
}: PaginationControlsProps) => {
  const nextPage = () => {
    if (onNextPage) {
      onNextPage();
    } else if (currentPage < totalPages - 1) {
      onPageChange(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (onPrevPage) {
      onPrevPage();
    } else if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  const firstPage = () => {
    if (onFirstPage) {
      onFirstPage();
    } else {
      onPageChange(0);
    }
  };

  const lastPage = () => {
    if (onLastPage) {
      onLastPage();
    } else {
      onPageChange(totalPages - 1);
    }
  };

  // Generate page numbers to show
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta + 1); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else if (currentPage - delta === 2) {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta + 1 < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (currentPage + delta + 1 === totalPages - 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) {
    return (
      <div className="p-4 border-t bg-gray-50 text-center">
        <span className="text-sm text-gray-500">
          Showing {Math.min(totalItems, 10)} of {totalItems} records
        </span>
      </div>
    );
  }

  const visiblePages = getVisiblePages();

  return (
    <div className="border-t bg-gray-50">
      <div className="p-4 flex items-center justify-center gap-2">
        {/* First page button */}
        <button
          onClick={firstPage}
          disabled={currentPage === 0}
          className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            currentPage === 0 
              ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
              : 'text-blue-600 hover:bg-blue-50 bg-white border border-gray-300'
          }`}
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous page button */}
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            currentPage === 0 
              ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
              : 'text-blue-600 hover:bg-blue-50 bg-white border border-gray-300'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) => (
            page === '...' ? (
              <span key={`dots-${index}`} className="px-2 py-1 text-gray-500">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange ? onPageChange(Number(page) - 1) : {}}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === Number(page) - 1
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100 bg-white border border-gray-300'
                }`}
              >
                {page}
              </button>
            )
          ))}
        </div>
        
        {/* Next page button */}
        <button
          onClick={nextPage}
          disabled={currentPage === totalPages - 1}
          className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            currentPage === totalPages - 1 
              ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
              : 'text-blue-600 hover:bg-blue-50 bg-white border border-gray-300'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last page button */}
        <button
          onClick={lastPage}
          disabled={currentPage === totalPages - 1}
          className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            currentPage === totalPages - 1 
              ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
              : 'text-blue-600 hover:bg-blue-50 bg-white border border-gray-300'
          }`}
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="px-4 pb-4 text-center">
        <span className="text-xs text-gray-500">
          Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} records (max 2500)
        </span>
      </div>
    </div>
  );
};
