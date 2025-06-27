
import { useGameResults } from "@/hooks/useGameResults";

interface ParityRecordProps {
  duration: number;
}

export const ParityRecord = ({ duration }: ParityRecordProps) => {
  const { results, loading } = useGameResults("parity", duration);

  const getColorDot = (colors: string[]) => {
    if (colors.length === 1) {
      return (
        <div 
          className={`w-3 h-3 rounded-full ${
            colors[0] === 'green' ? 'bg-green-500' : 
            colors[0] === 'red' ? 'bg-red-500' : 'bg-violet-500'
          }`}
        />
      );
    }
    
    return (
      <div className="flex gap-1">
        {colors.map((color, index) => (
          <div 
            key={index}
            className={`w-2 h-2 rounded-full ${
              color === 'green' ? 'bg-green-500' : 
              color === 'red' ? 'bg-red-500' : 'bg-violet-500'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm mb-4">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-800">Parity Record</h3>
        </div>
        <div className="p-4 text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  // Show only the latest 10 records
  const displayRecords = results.slice(0, 10);

  console.log('🎯 ParityRecord rendering with records:', displayRecords.length);
  
  return (
    <div className="bg-white rounded-lg shadow-sm mb-4">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-800">Parity Record</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Number</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
            </tr>
          </thead>
          <tbody>
            {displayRecords.map((record, index) => {
              console.log('📊 Displaying backend period:', record.period);
              
              return (
                <tr key={record.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="truncate">{record.period}</div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {record.number}
                  </td>
                  <td className="px-4 py-3">
                    {getColorDot(record.result_color || [])}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
