
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onNextPage?: () => void;
  onPrevPage?: () => void;
  onFirstPage?: () => void;
  onLastPage?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onFirst?: () => void;
  onLast?: () => void;
  startIndex?: number;
  endIndex?: number;
  totalItems?: number;
}

export const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  onNextPage,
  onPrevPage,
  onFirstPage,
  onLastPage,
  onNext,
  onPrev,
  onFirst,
  onLast,
  startIndex,
  endIndex,
  totalItems
}: PaginationControlsProps) => {
  const handleNext = onNextPage || onNext || (() => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  });

  const handlePrev = onPrevPage || onPrev || (() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  });

  const handleFirst = onFirstPage || onFirst || (() => {
    onPageChange(1);
  });

  const handleLast = onLastPage || onLast || (() => {
    onPageChange(totalPages);
  });

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center space-x-6 lg:space-x-8">
        {startIndex !== undefined && endIndex !== undefined && totalItems !== undefined && (
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            {startIndex + 1}-{endIndex} of {totalItems}
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={handleFirst}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={handlePrev}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={handleLast}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
