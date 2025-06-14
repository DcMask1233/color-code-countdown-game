import React, { useEffect, useState, useCallback } from "react";
import { GameResultsTable } from "./GameResultsTable";
import { UserBetsSection } from "./UserBetsSection";

interface UserBet {
  period: string;
  betType: "color" | "number";
  betValue: string | number;
  amount: number;
  result?: "win" | "lose";
  payout?: number;
  timestamp: Date;
}

interface GameRecordProps {
  userBets: UserBet[];
  gameType: string;
  duration: number;
  refreshInterval?: number; // in ms, default 30 seconds
}

export const GameRecord: React.FC<GameRecordProps> = ({
  userBets,
  gameType,
  duration,
  refreshInterval = 30000,
}) => {
  // This state can be used to trigger refresh in child components
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshResults = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  // Auto refresh every refreshInterval
  useEffect(() => {
    const interval = setInterval(() => {
      refreshResults();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, refreshResults]);

  return (
    <div className="space-y-4">
      {/* Pass refreshKey as key to force re-render */}
      <GameResultsTable
        key={`results-${refreshKey}`}
        gameType={gameType}
        duration={duration}
      />
      <UserBetsSection
        key={`bets-${refreshKey}`}
        userBets={userBets}
        gameType={gameType}
      />
    </div>
  );
};
