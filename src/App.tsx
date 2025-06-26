
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/useAuth";
import { AuthPage } from "@/components/auth/AuthPage";
import { MainGame } from "@/components/game/MainGame";
import { Loader2 } from "lucide-react";

function App() {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/auth" 
          element={user ? <Navigate to="/" replace /> : <AuthPage />} 
        />
        <Route 
          path="/*" 
          element={
            user && userProfile ? (
              <MainGame
                userBalance={userProfile.balance}
                userId={userProfile.user_code}
                onBalanceUpdate={() => {}} // No longer needed - handled by backend
                onLogout={async () => {
                  const { signOut } = useAuth();
                  await signOut();
                }}
                gameRecords={[]}
                onGameRecordsUpdate={() => {}} // No longer needed
                totalBetAmount={userProfile.total_bet_amount}
                totalDepositAmount={userProfile.total_deposit_amount}
                totalWithdrawAmount={userProfile.total_withdraw_amount}
                onStatsUpdate={() => {}} // No longer needed - handled by backend
              />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
