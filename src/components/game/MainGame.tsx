
import { useState } from "react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { BetPopup } from "@/components/game/BetPopup";
import { GameSection } from "@/components/game/GameSection";
import { ProfileSection } from "@/components/user/ProfileSection";
import { HomeSection } from "@/components/layout/HomeSection";
import { WalletSection } from "@/components/wallet/WalletSection";
import { PromotionSection } from "@/components/layout/PromotionSection";
import { useToast } from "@/hooks/use-toast";

interface GameRecord {
  period: string;
  number: number;
  color: string[];
}

interface MainGameProps {
  userBalance: number;
  userId: string;
  onBalanceUpdate: (amount: number) => void;
  onLogout: () => void;
  gameRecords: GameRecord[];
  onGameRecordsUpdate: (records: GameRecord[]) => void;
  totalBetAmount: number;
  totalDepositAmount: number;
  totalWithdrawAmount: number;
  onStatsUpdate: (type: 'bet' | 'deposit' | 'withdraw', amount: number) => void;
}

export const MainGame = ({
  userBalance,
  userId,
  onBalanceUpdate,
  onLogout,
  gameRecords,
  onGameRecordsUpdate,
  totalBetAmount,
  totalDepositAmount,
  totalWithdrawAmount,
  onStatsUpdate
}: MainGameProps) => {
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

  const handleRecharge = () => {
    toast({
      title: "Recharge",
      description: "Recharge functionality coming soon!",
    });
  };

  const handleWithdraw = () => {
    toast({
      title: "Withdraw",
      description: "Withdraw functionality coming soon!",
    });
  };

  const handleRefresh = () => {
    toast({
      title: "Refreshed",
      description: "Game data refreshed!",
    });
  };

  const getGameModeTitle = (mode: string) => {
    switch (mode) {
      case 'wingo-1min':
        return 'WinGo (1min)';
      case 'wingo-3min':
        return 'WinGo (3min)';
      case 'wingo-5min':
        return 'WinGo (5min)';
      default:
        return 'WinGo';
    }
  };

  const renderContent = () => {
    if (activeBottomTab === 'home') {
      if (selectedGameMode === null) {
        return (
          <HomeSection
            balance={userBalance}
            userId={userId}
            onRecharge={handleRecharge}
            onWithdraw={handleWithdraw}
            onRefresh={handleRefresh}
            onGameSelect={handleGameSelect}
          />
        );
      } else {
        return (
          <div className="min-h-screen bg-gray-100">
            <div className="bg-[#1e99eb] text-white p-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleBackToHome}
                  className="text-white hover:bg-blue-600 rounded p-1"
                >
                  ←
                </button>
                <h1 className="text-lg font-semibold">
                  {getGameModeTitle(selectedGameMode)}
                </h1>
              </div>
            </div>
            <div className="container mx-auto px-4 py-4 max-w-md">
              <GameSection
                activeGameTab={activeGameTab}
                onGameTabChange={setActiveGameTab}
                onRoundComplete={handleRoundComplete}
                onBettingStateChange={handleBettingStateChange}
                onColorSelect={handleColorSelect}
                onNumberSelect={handleNumberSelect}
                isBettingClosed={isBettingClosed}
                gameRecords={gameRecords}
                gameMode={selectedGameMode}
              />
            </div>
          </div>
        );
      }
    }

    if (activeBottomTab === 'wallet') {
      return (
        <WalletSection
          userBalance={userBalance}
          totalBetAmount={totalBetAmount}
          totalDepositAmount={totalDepositAmount}
          totalWithdrawAmount={totalWithdrawAmount}
          onBack={handleBackToHome}
          onDeposit={() => toast({ title: "Deposit", description: "Deposit functionality coming soon!" })}
          onWithdraw={() => toast({ title: "Withdraw", description: "Withdraw functionality coming soon!" })}
          onDepositHistory={() => toast({ title: "Deposit History", description: "History functionality coming soon!" })}
          onWithdrawHistory={() => toast({ title: "Withdrawal History", description: "History functionality coming soon!" })}
        />
      );
    }

    if (activeBottomTab === 'promotion') {
      return <PromotionSection />;
    }

    if (activeBottomTab === 'my') {
      return (
        <div className="container mx-auto px-4 py-4 max-w-md">
          <ProfileSection
            userBalance={userBalance}
            onLogout={onLogout}
          />
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-4 max-w-md">
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Coming Soon</h1>
          <p className="text-gray-600">This feature is under development.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {renderContent()}

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
