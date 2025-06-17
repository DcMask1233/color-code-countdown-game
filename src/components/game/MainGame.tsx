import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MainGameContent } from "@/components/game/MainGameContent";
import { useMainGameLogic } from "@/components/game/MainGameLogic";

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
  const {
    activeBottomTab,
    selectedGameMode,
    setActiveBottomTab,
    handleGameSelect,
    handleBackToHome,
    handleRoundComplete,
    handleNavigateToPromotion
  } = useMainGameLogic({
    userBalance,
    onBalanceUpdate,
    onStatsUpdate,
    gameRecords,
    onGameRecordsUpdate
  });

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <MainGameContent
        activeBottomTab={activeBottomTab}
        selectedGameMode={selectedGameMode}
        userBalance={userBalance}
        userId={userId}
        totalBetAmount={totalBetAmount}
        totalDepositAmount={totalDepositAmount}
        totalWithdrawAmount={totalWithdrawAmount}
        gameRecords={gameRecords}
        onGameSelect={handleGameSelect}
        onBackToHome={handleBackToHome}
        onRoundComplete={handleRoundComplete}
        onBalanceUpdate={onBalanceUpdate}
        onGameRecordsUpdate={onGameRecordsUpdate}
        onNavigateToPromotion={handleNavigateToPromotion}
        onLogout={onLogout}
      />

      <BottomNavigation
        activeTab={activeBottomTab}
        onTabChange={setActiveBottomTab}
      />
    </div>
  );
};
