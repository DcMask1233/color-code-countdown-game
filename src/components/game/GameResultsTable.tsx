import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // adjust path if needed

interface GameRecord {
  period: string;
  number: number;
  color: string[] | null;
  gameType: string;
  duration: number;
}

interface Props {
  gameType: string;
  duration: number;
}

export const GameResultsTable: React.FC<Props> = ({ gameType, duration }) => {
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("game_results")
        .select("period, number, result_color, game_type, duration")
        .eq("game_type", gameType)
        .eq("duration", duration)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedData = (data || []).map((item: any) => ({
        period: item.period,
        number: item.number,
        color: item.result_color || null,
        gameType: item.game_type,
        duration: item.duration,
      }));

      setRecords(formattedData);
    } catch (error) {
      console.error("Error fetching game results:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [gameType, duration]);

  return (
    <div>
      <h3>
        Results for {gameType} - {duration} min
      </h3>
      {loading && <p>Loading...</p>}
      {!loading && records.length === 0 && <p>No results found.</p>}
      {!loading && records.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Period</th>
              <th>Number</th>
              <th>Color</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.period}>
                <td>{record.period}</td>
                <td>{record.number}</td>
                <td>{record.color ? record.color.join(", ") : "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
