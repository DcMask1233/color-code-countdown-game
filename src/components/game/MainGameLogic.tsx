
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface GameRecord {
  period: string;
  number: number;
  color: string[];
}

interface UseMainGameLogicProps {
  userBalance: number;
  onBalanceUpdate: (amount: number) => void;
  onStatsUpdate: (type: 'bet' | 'deposit' | 'withdraw', amount: number) => void;
  gameRecords: GameRecord[];
  onGameRecordsUpdate: (records: GameRecord[]) => void;
}

export const useMainGameLogic = ({
  userBalance,
  onBalanceUpdate,
  onStatsUpdate,
  gameRecords,
  onGameRecordsUpdate
}: UseMainGameLogicProps) => {
  const [activeBottomTab, setActiveBottomTab] = useState('home');
  const [selectedGameMode, setSelectedGameMode] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGameSelect = (gameMode: string) => {
    setSelectedGameMode(gameMode);
  };

  const handleBackToHome = () => {
    setSelectedGameMode(null);
    setActiveBottomTab('home');
  };

  const handleRoundComplete = (newPeriod: string, winningNumber: number, gameType: string) => {
    toast({
      title: "Round Complete!",
      description: `${gameType.toUpperCase()}: Winning number is ${winningNumber}`,
    });
  };

  const handleNavigateToPromotion = () => {
    setActiveBottomTab('promotion');
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
};
