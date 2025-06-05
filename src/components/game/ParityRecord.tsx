
interface GameRecord {
  period: string;
  number: number;
  color: string[];
}

interface ParityRecordProps {
  records: GameRecord[];
}

export const ParityRecord = ({ records }: ParityRecordProps) => {
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
            {records.slice(0, 8).map((record, index) => (
              <tr key={record.period} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {record.period.slice(-6)}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                  {record.number}
                </td>
                <td className="px-4 py-3">
                  {getColorDot(record.color)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
