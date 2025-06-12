
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
      <div className="p-4 border-t bg-gray-50 text-center">
        <span className="text-sm text-gray-500">
          Showing {Math.min(totalItems, 10)} of {totalItems} records
        </span>
      </div>
    );
  }

  return (
    <div className="border-t bg-gray-50">
      <div className="p-4 flex items-center justify-center gap-4">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            currentPage === 0 
              ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
              : 'text-blue-600 hover:bg-blue-50 bg-white border border-gray-300'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </button>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Page {currentPage + 1} of {totalPages}
          </span>
        </div>
        
        <button
          onClick={nextPage}
          disabled={currentPage === totalPages - 1}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            currentPage === totalPages - 1 
              ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
              : 'text-blue-600 hover:bg-blue-50 bg-white border border-gray-300'
          }`}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="px-4 pb-4 text-center">
        <span className="text-xs text-gray-500">
          Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} records
        </span>
      </div>
    </div>
  );
};
