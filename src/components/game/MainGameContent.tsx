import { HomeSection } from "@/components/layout/HomeSection";
import { WalletSection } from "@/components/wallet/WalletSection";
import { PromotionSection } from "@/components/layout/PromotionSection";
import { MySection } from "@/components/user/MySection";
import { UniversalGameContainer } from "@/components/game/UniversalGameContainer";
import { useToast } from "@/hooks/use-toast";
import { getNumberColor } from "@/lib/gameUtils"; // ✅ Imported from utils

interface GameRecord {
  period: string;
  number: number;
  color: string[];
}

interface MainGameContentProps {
  activeBottomTab: string;
  selectedGameMode: "Wingo1min" | "Wingo3min" | "Wingo5min" | null;
  userBalance: number;
  userId: string;
  totalBetAmount: number;
  totalDepositAmount: number;
  totalWithdrawAmount: number;
  gameRecords: GameRecord[];
  onGameSelect: (gameMode: string) => void;
  onBackToHome: () => void;
  onRoundComplete: (newPeriod: string, winningNumber: number, gameType: string) => void;
  onBalanceUpdate: (amount: number) => void;
  onGameRecordsUpdate: (records: GameRecord[]) => void;
  onNavigateToPromotion: () => void;
  onLogout: () => void;
}

export const MainGameContent = ({
  activeBottomTab,
  selectedGameMode,
  userBalance,
  userId,
  totalBetAmount,
  totalDepositAmount,
  totalWithdrawAmount,
  gameRecords,
  onGameSelect,
  onBackToHome,
  onRoundComplete,
  onBalanceUpdate,
  onGameRecordsUpdate,
  onNavigateToPromotion,
  onLogout,
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

  const handleRoundCompleteWithRecords = (
    newPeriod: string,
    winningNumber: number,
    gameType: string
  ) => {
    const newRecord: GameRecord = {
      period: newPeriod,
      number: winningNumber,
      color: getNumberColor(winningNumber), // ✅ From utils
    };

    const updatedRecords = [newRecord, ...gameRecords].slice(0, 10);
    onGameRecordsUpdate(updatedRecords);
    onRoundComplete(newPeriod, winningNumber, gameType);
  };

  if (activeBottomTab === "home") {
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
        <UniversalGameContainer
          gameMode={selectedGameMode}
          userBalance={userBalance}
          gameRecords={gameRecords}
          onBackToHome={onBackToHome}
          onRoundComplete={handleRoundCompleteWithRecords}
          onBalanceUpdate={onBalanceUpdate}
          onGameRecordsUpdate={onGameRecordsUpdate}
        />
      );
    }
  }

  if (activeBottomTab === "wallet") {
    return (
      <WalletSection
        userBalance={userBalance}
        totalBetAmount={totalBetAmount}
        totalDepositAmount={totalDepositAmount}
        totalWithdrawAmount={totalWithdrawAmount}
        onBack={onBackToHome}
        onDeposit={() =>
          toast({ title: "Deposit", description: "Deposit functionality coming soon!" })
        }
        onWithdraw={() =>
          toast({ title: "Withdraw", description: "Withdraw functionality coming soon!" })
        }
        onDepositHistory={() =>
          toast({ title: "Deposit History", description: "History functionality coming soon!" })
        }
        onWithdrawHistory={() =>
          toast({
            title: "Withdrawal History",
            description: "History functionality coming soon!",
          })
        }
      />
    );
  }

  if (activeBottomTab === "promotion") {
    return <PromotionSection />;
  }

  if (activeBottomTab === "my") {
    const savedUser = localStorage.getItem("colorGameUser");
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
