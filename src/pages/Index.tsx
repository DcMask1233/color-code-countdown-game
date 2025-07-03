import { useAuth } from "@/hooks/useAuth";
import { MainGame } from "@/components/game/MainGame";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Index = () => {
  const { user, userProfile, isLoading } = useAuth();
  const navigate = useNavigate();

  const [gameRecords, setGameRecords] = useState([]);
  const [totalBetAmount, setTotalBetAmount] = useState(0);
  const [totalDepositAmount, setTotalDepositAmount] = useState(0);
  const [totalWithdrawAmount, setTotalWithdrawAmount] = useState(0);

  // Redirect to login page if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      console.log('🔄 User not authenticated, redirecting to auth');
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  // Show loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your game...</p>
        </div>
      </div>
    );
  }

  // If still no user (redirect happening)
  if (!user) {
    return null;
  }

  const handleBalanceUpdate = (amount: number) => {
    console.log("Balance update requested:", amount);
    // Trigger profile refresh to get updated balance
    if (userProfile) {
      // The balance should be updated by the backend functions
      // We'll refresh the profile to get the latest data
      window.location.reload(); // Simple refresh for now
    }
  };

  const handleLogout = () => {
    console.log("Logout clicked");
    // Implement logout logic if needed
  };

  const handleGameRecordsUpdate = (records: any[]) => {
    setGameRecords(records);
  };

  const handleStatsUpdate = (
    type: "bet" | "deposit" | "withdraw",
    amount: number
  ) => {
    if (type === "bet") setTotalBetAmount(prev => prev + amount);
    if (type === "deposit") setTotalDepositAmount(prev => prev + amount);
    if (type === "withdraw") setTotalWithdrawAmount(prev => prev + amount);
  };

  return (
    <MainGame
      userId={user.id}
      userBalance={userProfile?.balance || 0}
      onBalanceUpdate={handleBalanceUpdate}
      onLogout={handleLogout}
      gameRecords={gameRecords}
      onGameRecordsUpdate={handleGameRecordsUpdate}
      totalBetAmount={totalBetAmount}
      totalDepositAmount={totalDepositAmount}
      totalWithdrawAmount={totalWithdrawAmount}
      onStatsUpdate={handleStatsUpdate}
    />
  );
};

export default Index;
