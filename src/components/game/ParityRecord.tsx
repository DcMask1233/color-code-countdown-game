
import { useGameResults } from "@/hooks/useGameResults";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ParityRecordProps {
  duration: number;
}

export const ParityRecord = ({ duration }: ParityRecordProps) => {
  // Convert duration to game mode
  const gameMode = duration === 60 ? 'wingo1min' : 
                   duration === 180 ? 'wingo3min' : 
                   duration === 300 ? 'wingo5min' : 'wingo1min';

  const { results, loading, refetch } = useGameResults("parity", gameMode);

  // Set up real-time subscription for new results
  useEffect(() => {
    const channel = supabase
      .channel('parity_results_realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_periods',
          filter: `game_type=eq.parity AND game_mode=eq.${gameMode}`
        },
        (payload) => {
          console.log('🔄 New parity result received:', payload.new);
          refetch(); // Refresh the results when new data comes in
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameMode, refetch]);

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

  console.log('🎯 ParityRecord displaying records with new format:', displayRecords.length);
  
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
              console.log('📊 Backend period format:', record.period);
              
              return (
                <tr key={record.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="truncate">{record.period}</div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {record.result?.number || 0}
                  </td>
                  <td className="px-4 py-3">
                    {getColorDot(record.result?.colors || [])}
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
