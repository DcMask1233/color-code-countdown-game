
import { Badge } from "@/components/ui/badge";
import { useGameResults } from "@/hooks/useGameResults";
import { PaginationControls } from "./PaginationControls";

interface SecureGameResultsTableProps {
  gameType: string;
  gameMode: string;
}

export const SecureGameResultsTable = ({ gameType, gameMode }: SecureGameResultsTableProps) => {
  const { 
    results, 
    loading, 
    currentPage, 
    totalPages, 
    goToPage, 
    nextPage, 
    prevPage, 
    goToFirstPage, 
    goToLastPage 
  } = useGameResults(gameType, gameMode);

  const getColorDot = (color: string) => {
    const colorClass = color === 'green' ? 'bg-green-500' : 
                     color === 'red' ? 'bg-red-500' : 
                     color === 'violet' ? 'bg-purple-500' : 'bg-gray-500';
    
    return <div className={`w-3 h-3 rounded-full ${colorClass}`} />;
  };

  if (loading) {
    return <div className="flex justify-center p-4">Loading results...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-2 font-medium text-gray-600">Period</th>
              <th className="text-left p-2 font-medium text-gray-600">Number</th>
              <th className="text-left p-2 font-medium text-gray-600">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {results.map((result) => (
              <tr key={result.id} className="hover:bg-gray-50">
                <td className="p-2 font-mono text-xs">{result.period}</td>
                <td className="p-2">
                  <Badge variant="outline" className="font-semibold">
                    {result.result?.number}
                  </Badge>
                </td>
                <td className="p-2">
                  <div className="flex items-center gap-1">
                    {result.result?.colors?.map((color, index) => (
                      <div key={index} className="flex items-center gap-1">
                        {getColorDot(color)}
                        <span className="text-xs capitalize">{color}</span>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          onNext={nextPage}
          onPrev={prevPage}
          onFirst={goToFirstPage}
          onLast={goToLastPage}
        />
      )}
    </div>
  );
};
