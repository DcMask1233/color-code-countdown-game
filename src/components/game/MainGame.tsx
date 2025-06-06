
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
        activeGameTab={activeGameTab}
        showBetPopup={showBetPopup}
        selectedBetType={selectedBetType}
        selectedBetValue={selectedBetValue}
        isBettingClosed={isBettingClosed}
        userBalance={userBalance}
        userId={userId}
        totalBetAmount={totalBetAmount}
        totalDepositAmount={totalDepositAmount}
        totalWithdrawAmount={totalWithdrawAmount}
        gameRecords={gameRecords}
        onGameTabChange={setActiveGameTab}
        onGameSelect={handleGameSelect}
        onBackToHome={handleBackToHome}
        onBetPopupClose={() => setShowBetPopup(false)}
        onRoundComplete={handleRoundComplete}
        onBettingStateChange={handleBettingStateChange}
        onColorSelect={handleColorSelect}
        onNumberSelect={handleNumberSelect}
        onConfirmBet={handleConfirmBet}
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
