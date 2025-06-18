import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface GameRecord {
  period: string;
  number: number;
  color: string[] | null; // allow null to avoid errors
  gameType?: string;
  duration?: number;
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
        // alias result_color to color (Step 6)
        .select("period, number, result_color AS color")
        .eq("game_type", gameType)
        .eq("duration", duration)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error("Error fetching game results:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [gameType, duration]);

  // Step 4: Add this to log the fetched records for debugging
  useEffect(() => {
    console.log("Fetched records:", records);
  }, [records]);

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
                {/* Step 5: safely handle possible undefined/null colors */}
                <td>{record.color?.join(", ") ?? "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
