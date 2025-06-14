import React, { useEffect, useState } from "react";

interface GameRecord {
  period: string;
  number: number;
  color: string[];
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

  // Function to fetch latest game results from backend or API
  const fetchResults = async () => {
    setLoading(true);
    try {
      // Replace with your actual API endpoint or data fetching logic
      const response = await fetch(
        `/api/game-results?gameType=${gameType}&duration=${duration}`
      );
      if (!response.ok) throw new Error("Failed to fetch game results");
      const data: GameRecord[] = await response.json();
      setRecords(data);
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
                <td>{record.color.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
