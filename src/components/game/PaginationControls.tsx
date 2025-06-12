
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  startIndex: number;
  endIndex: number;
  totalItems: number;
}

export const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  startIndex,
  endIndex,
  totalItems
}: PaginationControlsProps) => {
  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      onPageChange(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  if (totalPages <= 1) {
    return (
      <div className="p-3 border-t bg-gray-50 text-center">
        <span className="text-sm text-gray-500">
          {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="p-3 border-t bg-gray-50 flex items-center justify-center gap-4">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className={`flex items-center gap-1 px-3 py-1 rounded ${
            currentPage === 0 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-blue-600 hover:bg-blue-50'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </button>
        
        <div className="flex items-center gap-2">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 rounded ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {pageNum + 1}
              </button>
            );
          })}
        </div>
        
        <button
          onClick={nextPage}
          disabled={currentPage === totalPages - 1}
          className={`flex items-center gap-1 px-3 py-1 rounded ${
            currentPage === totalPages - 1 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-blue-600 hover:bg-blue-50'
          }`}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-3 border-t bg-gray-50 text-center">
        <span className="text-sm text-gray-500">
          {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}
        </span>
      </div>
    </>
  );
};
