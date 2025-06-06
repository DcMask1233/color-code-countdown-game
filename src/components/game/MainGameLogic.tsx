
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
  const [activeGameTab, setActiveGameTab] = useState('parity');
  const [activeBottomTab, setActiveBottomTab] = useState('home');
  const [selectedGameMode, setSelectedGameMode] = useState<string | null>(null);
  const [showBetPopup, setShowBetPopup] = useState(false);
  const [selectedBetType, setSelectedBetType] = useState<'color' | 'number'>('color');
  const [selectedBetValue, setSelectedBetValue] = useState<string | number>('');
  const [isBettingClosed, setIsBettingClosed] = useState(false);
  const { toast } = useToast();

  const getNumberColor = (num: number): string[] => {
    if (num === 0) return ["violet", "red"];
    if (num === 5) return ["violet", "green"];
    return num % 2 === 0 ? ["red"] : ["green"];
  };

  const handleGameSelect = (gameMode: string) => {
    setSelectedGameMode(gameMode);
  };

  const handleBackToHome = () => {
    setSelectedGameMode(null);
    setActiveBottomTab('home');
  };

  const handleColorSelect = (color: string) => {
    if (isBettingClosed) {
      toast({
        title: "Betting Closed",
        description: "Please wait for the next round to place bets.",
        variant: "destructive"
      });
      return;
    }
    setSelectedBetType('color');
    setSelectedBetValue(color);
    setShowBetPopup(true);
  };

  const handleNumberSelect = (number: number) => {
    if (isBettingClosed) {
      toast({
        title: "Betting Closed",
        description: "Please wait for the next round to place bets.",
        variant: "destructive"
      });
      return;
    }
    setSelectedBetType('number');
    setSelectedBetValue(number);
    setShowBetPopup(true);
  };

  const handleConfirmBet = (amount: number) => {
    onBalanceUpdate(-amount);
    onStatsUpdate('bet', amount);
    
    toast({
      title: "Bet Placed!",
      description: `₹${amount} bet placed on ${selectedBetType}: ${selectedBetValue}`,
    });
  };

  const handleRoundComplete = (newPeriod: string, winningNumber: number) => {
    const newRecord = {
      period: newPeriod,
      number: winningNumber,
      color: getNumberColor(winningNumber)
    };

    const updatedRecords = [newRecord, ...gameRecords].slice(0, 10);
    onGameRecordsUpdate(updatedRecords);
    
    toast({
      title: "Round Complete!",
      description: `Winning number: ${winningNumber}`,
    });
  };

  const handleBettingStateChange = (isClosed: boolean) => {
    setIsBettingClosed(isClosed);
    if (isClosed && showBetPopup) {
      setShowBetPopup(false);
    }
  };

  const handleNavigateToPromotion = () => {
    setActiveBottomTab('promotion');
  };

  return {
    activeGameTab,
    activeBottomTab,
    selectedGameMode,
    showBetPopup,
    selectedBetType,
    selectedBetValue,
    isBettingClosed,
    setActiveGameTab,
    setActiveBottomTab,
    setShowBetPopup,
    handleGameSelect,
    handleBackToHome,
    handleColorSelect,
    handleNumberSelect,
    handleConfirmBet,
    handleRoundComplete,
    handleBettingStateChange,
    handleNavigateToPromotion
  };
};
