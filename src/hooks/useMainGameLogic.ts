
import { useState } from "react";

interface GameRecord {
  period: string;
  number: number;
  color: string[];
}

interface UseMainGameLogicProps {
  userBalance: number;
  onBalanceUpdate: (amount: number) => void;
  onStatsUpdate: (type: "bet" | "deposit" | "withdraw", amount: number) => void;
  gameRecords: GameRecord[];
  onGameRecordsUpdate: (records: GameRecord[]) => void;
}

export function useMainGameLogic({
  userBalance,
  onBalanceUpdate,
  onStatsUpdate,
  gameRecords,
  onGameRecordsUpdate
}: UseMainGameLogicProps) {
  const [activeBottomTab, setActiveBottomTab] = useState<"home" | "wallet" | "promotion" | "my">("home");
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const handleGameSelect = (gameId: string) => {
    console.log("Game selected:", gameId);
    setSelectedGame(gameId);
    setActiveBottomTab("home");
  };

  const handleBackToHome = () => {
    setSelectedGame(null);
  };

  const handleRoundComplete = (newPeriod: string, winningNumber: number, gameType: string) => {
    console.log(`Round completed for ${gameType}: Period ${newPeriod}, Winning Number: ${winningNumber}`);
    // Handle stats update or balance update here if needed
  };

  const handleNavigateToPromotion = () => {
    setActiveBottomTab("promotion");
  };

  return {
    activeBottomTab,
    selectedGame,
    setActiveBottomTab,
    handleGameSelect,
    handleBackToHome,
    handleRoundComplete,
    handleNavigateToPromotion
  };
}
