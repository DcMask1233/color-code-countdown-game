
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { BetPopup } from "@/components/game/BetPopup";
import { GameSection } from "@/components/game/GameSection";
import { ProfileSection } from "@/components/user/ProfileSection";
import { PlaceholderSection } from "@/components/layout/PlaceholderSection";
import { useToast } from "@/hooks/use-toast";

interface GameRecord {
  period: string;
  number: number;
  color: string[];
}

interface MainGameProps {
  userBalance: number;
  onBalanceUpdate: (amount: number) => void;
  onLogout: () => void;
  gameRecords: GameRecord[];
  onGameRecordsUpdate: (records: GameRecord[]) => void;
}

export const MainGame = ({
  userBalance,
  onBalanceUpdate,
  onLogout,
  gameRecords,
  onGameRecordsUpdate
}: MainGameProps) => {
  const [activeGameTab, setActiveGameTab] = useState('parity');
  const [activeBottomTab, setActiveBottomTab] = useState('home');
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

  const handleRecharge = () => {
    toast({
      title: "Recharge",
      description: "Recharge functionality coming soon!",
    });
  };

  const handleReadRules = () => {
    toast({
      title: "Rules",
      description: "Game rules will be displayed here!",
    });
  };

  const handleRefresh = () => {
    toast({
      title: "Refreshed",
      description: "Game data refreshed!",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <Header
        balance={userBalance}
        onRecharge={handleRecharge}
        onReadRules={handleReadRules}
        onRefresh={handleRefresh}
      />

      <div className="container mx-auto px-4 py-4 max-w-md">
        {activeBottomTab === 'home' && (
          <GameSection
            activeGameTab={activeGameTab}
            onGameTabChange={setActiveGameTab}
            onRoundComplete={handleRoundComplete}
            onBettingStateChange={handleBettingStateChange}
            onColorSelect={handleColorSelect}
            onNumberSelect={handleNumberSelect}
            isBettingClosed={isBettingClosed}
            gameRecords={gameRecords}
          />
        )}

        {activeBottomTab === 'my' && (
          <ProfileSection
            userBalance={userBalance}
            onLogout={onLogout}
          />
        )}

        {(activeBottomTab === 'search' || activeBottomTab === 'newgame' || activeBottomTab === 'win') && (
          <PlaceholderSection title={activeBottomTab} />
        )}
      </div>

      <BetPopup
        isOpen={showBetPopup}
        onClose={() => setShowBetPopup(false)}
        selectedType={selectedBetType}
        selectedValue={selectedBetValue}
        userBalance={userBalance}
        onConfirmBet={handleConfirmBet}
        disabled={isBettingClosed}
      />

      <BottomNavigation
        activeTab={activeBottomTab}
        onTabChange={setActiveBottomTab}
      />
    </div>
  );
};
