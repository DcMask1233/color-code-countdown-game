import React, { useState } from "react";
import { MainGameContent } from "@/components/game/MainGameContent";

export default function HomePage() {
  const [activeBottomTab, setActiveBottomTab] = useState("home");
  const [selectedGameMode, setSelectedGameMode] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState(1000);
  const [userId] = useState("12345");
  const [totalBetAmount, setTotalBetAmount] = useState(0);
  const [totalDepositAmount] = useState(0);
  const [totalWithdrawAmount] = useState(0);
  const [gameRecords, setGameRecords] = useState([]);

  const handleGameSelect = (gameMode: string) => {
    setSelectedGameMode(gameMode);
  };

  const handleBackToHome = () => {
    setSelectedGameMode(null);
  };

  const handleRoundComplete = (
    period: string,
    winningNumber: number,
    gameType: string
  ) => {
    // update game records
    setGameRecords((prev) => [
      ...prev,
      { period, number: winningNumber, color: [] }, // Color array can be set according to logic
    ]);
  };

  const handleBalanceUpdate = (amount: number) => {
    setUserBalance((prev) => prev + amount);
  };

  const handleGameRecordsUpdate = (records: any[]) => {
    setGameRecords(records);
  };

  const handleNavigateToPromotion = () => {
    alert("Navigate to promotion page (not implemented).");
  };

  const handleLogout = () => {
    alert("Logout clicked (not implemented).");
  };

  return (
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
      onBalanceUpdate={handleBalanceUpdate}
      onGameRecordsUpdate={handleGameRecordsUpdate}
      onNavigateToPromotion={handleNavigateToPromotion}
      onLogout={handleLogout}
    />
  );
}
