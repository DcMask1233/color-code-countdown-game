import { useState } from "react";

type GameMode = "Wingo1min" | "Wingo3min" | "Wingo5min";

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
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode | null>(null);

  const handleGameSelect = (mode: string) => {
    if (["Wingo1min", "Wingo3min", "Wingo5min"].includes(mode)) {
      setSelectedGameMode(mode as GameMode);
    } else {
      console.warn("Invalid game mode selected:", mode);
    }
  };

  const handleBackToHome = () => {
    setSelectedGameMode(null);
  };

  const handleRoundComplete = (newPeriod: string, winningNumber: number, gameType: string) => {
    console.log(`Round completed for ${gameType}: Period ${newPeriod}, Winning Number: ${winningNumber}`);
    // Logic for updating user balance, win/loss handling etc. can be triggered here
  };

  const handleNavigateToPromotion = () => {
    setActiveBottomTab("promotion");
  };

  return {
    activeBottomTab,
    selectedGameMode,
    setActiveBottomTab,
    handleGameSelect,
    handleBackToHome,
    handleRoundComplete,
    handleNavigateToPromotion
  };
}
