import React, { useEffect, useState } from "react";
import { HomeSection } from "@/components/layout/HomeSection";
import { WalletSection } from "@/components/wallet/WalletSection";
import { PromotionSection } from "@/components/layout/PromotionSection";
import { MySection } from "@/components/user/MySection";
import WingoGamePage from "@/components/game/WingoGamePage";
import { useToast } from "@/hooks/use-toast";
import { getNumberColor } from "@/lib/gameUtils";

interface GameRecord {
  period: string;
  number: number;
  color: string[];
}

interface MainGameContentProps {
  activeBottomTab: "home" | "wallet" | "promotion" | "my";
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
  onBalanceUpdate: (newBalance: number) => void;
  onGameRecordsUpdate: (updatedRecords: GameRecord[]) => void;
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

  // New state for period and time left, fetched from backend
  const [currentPeriod, setCurrentPeriod] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Fetch current period and time left from backend API (replace URL with your actual endpoint)
  async function fetchPeriod() {
    try {
      const res = await fetch("/api/currentPeriod");
      if (!res.ok) throw new Error("Failed to fetch period info");
      const data = await res.json();

      setCurrentPeriod(data.currentPeriod);
      setTimeLeft(data.timeLeft);
    } catch (error) {
      console.error("Error fetching period data:", error);
    }
  }

  useEffect(() => {
    fetchPeriod();

    // Refresh every second for countdown
    const interval = setInterval(() => {
      fetchPeriod();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRecharge = () => {
    toast({ title: "Recharge", description: "Recharge functionality coming soon!" });
  };

  const handleWithdraw = () => {
    toast({ title: "Withdraw", description: "Withdraw functionality coming soon!" });
  };

  const handleRefresh = () => {
    toast({ title: "Refreshed", description: "Game data refreshed!" });
  };

  const handleRoundCompleteWithRecords = (
    newPeriod: string,
    winningNumber: number,
    gameType: string
  ) => {
    const newRecord: GameRecord = {
      period: newPeriod,
      number: winningNumber,
      color: getNumberColor(winningNumber),
    };

    const updatedRecords = [newRecord, ...gameRecords].slice(0, 10);
    onGameRecordsUpdate(updatedRecords);
    onRoundComplete(newPeriod, winningNumber, gameType);
  };

  // === HOME TAB ===
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
    }

    // Render WingoGamePage with all backend props passed down
    if (
      selectedGameMode === "Wingo1min" ||
      selectedGameMode === "Wingo3min" ||
      selectedGameMode === "Wingo5min"
    ) {
      return (
        <WingoGamePage
          gameType="Wingo"
          gameMode={selectedGameMode}
          userBalance={userBalance}
          currentPeriod={currentPeriod}
          timeLeft={timeLeft}
          gameRecords={gameRecords}
          onBackToHome={onBackToHome}
          onRoundComplete={handleRoundCompleteWithRecords}
          onBalanceUpdate={onBalanceUpdate}
          onGameRecordsUpdate={onGameRecordsUpdate}
        />
      );
    }

    return (
      <div className="p-6 max-w-md mx-auto text-center text-red-600">
        Unsupported game mode selected.
      </div>
    );
  }

  // === WALLET TAB ===
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
          toast({ title: "Withdrawal History", description: "History functionality coming soon!" })
        }
      />
    );
  }

  // === PROMOTION TAB ===
  if (activeBottomTab === "promotion") {
    return <PromotionSection />;
  }

  // === MY TAB ===
  if (activeBottomTab === "my") {
    const savedUser = localStorage.getItem("colorGameUser");
    const mobile = savedUser ? JSON.parse(savedUser)?.mobile : undefined;

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

  // === FALLBACK ===
  return (
    <div className="container mx-auto px-4 py-4 max-w-md">
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Coming Soon</h1>
        <p className="text-gray-600">This feature is under development.</p>
      </div>
    </div>
  );
};
