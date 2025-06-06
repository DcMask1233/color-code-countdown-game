
import { HomeSection } from "@/components/layout/HomeSection";
import { WalletSection } from "@/components/wallet/WalletSection";
import { PromotionSection } from "@/components/layout/PromotionSection";
import { MySection } from "@/components/user/MySection";
import { GameContainer } from "@/components/game/GameContainer";
import { useToast } from "@/hooks/use-toast";

interface GameRecord {
  period: string;
  number: number;
  color: string[];
}

interface MainGameContentProps {
  activeBottomTab: string;
  selectedGameMode: string | null;
  activeGameTab: string;
  showBetPopup: boolean;
  selectedBetType: 'color' | 'number';
  selectedBetValue: string | number;
  isBettingClosed: boolean;
  userBalance: number;
  userId: string;
  totalBetAmount: number;
  totalDepositAmount: number;
  totalWithdrawAmount: number;
  gameRecords: GameRecord[];
  onGameTabChange: (tab: string) => void;
  onGameSelect: (gameMode: string) => void;
  onBackToHome: () => void;
  onBetPopupClose: () => void;
  onRoundComplete: (newPeriod: string, winningNumber: number) => void;
  onBettingStateChange: (isClosed: boolean) => void;
  onColorSelect: (color: string) => void;
  onNumberSelect: (number: number) => void;
  onConfirmBet: (amount: number) => void;
  onNavigateToPromotion: () => void;
  onLogout: () => void;
}

export const MainGameContent = ({
  activeBottomTab,
  selectedGameMode,
  activeGameTab,
  showBetPopup,
  selectedBetType,
  selectedBetValue,
  isBettingClosed,
  userBalance,
  userId,
  totalBetAmount,
  totalDepositAmount,
  totalWithdrawAmount,
  gameRecords,
  onGameTabChange,
  onGameSelect,
  onBackToHome,
  onBetPopupClose,
  onRoundComplete,
  onBettingStateChange,
  onColorSelect,
  onNumberSelect,
  onConfirmBet,
  onNavigateToPromotion,
  onLogout
}: MainGameContentProps) => {
  const { toast } = useToast();

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

  if (activeBottomTab === 'home') {
    if (selectedGameMode === null) {
      return (
        <HomeSection
          balance={userBalance}
          userId={userId}
          onRecharge={handleRecharge}
          onWithdraw={handleWithdraw}
          onRefresh={handleRefresh}
          onGameSelect={onGameSelect}
        />
      );
    } else {
      return (
        <GameContainer
          activeGameTab={activeGameTab}
          selectedGameMode={selectedGameMode}
          showBetPopup={showBetPopup}
          selectedBetType={selectedBetType}
          selectedBetValue={selectedBetValue}
          isBettingClosed={isBettingClosed}
          userBalance={userBalance}
          gameRecords={gameRecords}
          onGameTabChange={onGameTabChange}
          onBackToHome={onBackToHome}
          onBetPopupClose={onBetPopupClose}
          onRoundComplete={onRoundComplete}
          onBettingStateChange={onBettingStateChange}
          onColorSelect={onColorSelect}
          onNumberSelect={onNumberSelect}
          onConfirmBet={onConfirmBet}
        />
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
        onBack={onBackToHome}
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
    const savedUser = localStorage.getItem('colorGameUser');
    const mobile = savedUser ? JSON.parse(savedUser).mobile : undefined;
    
    return (
      <MySection
        userBalance={userBalance}
        userId={userId}
        mobile={mobile}
        onLogout={onLogout}
        onNavigateToPromotion={onNavigateToPromotion}
        gameRecords={gameRecords}
      />
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
