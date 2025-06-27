
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/useAuth";
import { AuthPage } from "@/components/auth/AuthPage";
import { MainGame } from "@/components/game/MainGame";
import AdminLogin from "@/pages/admin/login";
import AdminPanel from "@/pages/admin/index";
import { Loader2 } from "lucide-react";

function App() {
  const { user, userProfile, loading } = useAuth();

  console.log('App render state:', { user: !!user, userProfile: !!userProfile, loading });

  if (loading) {
    console.log('App is loading...');
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  console.log('App finished loading, rendering routes');

  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPanel />} />
        
        {/* Auth Route */}
        <Route 
          path="/auth" 
          element={user ? <Navigate to="/" replace /> : <AuthPage />} 
        />
        
        {/* Main App Routes */}
        <Route 
          path="/*" 
          element={
            user ? (
              userProfile ? (
                <MainGame
                  userBalance={userProfile.balance}
                  userId={userProfile.user_code}
                  onBalanceUpdate={() => {}} // No longer needed - handled by backend
                  onLogout={() => {}} // Will be handled by MainGame
                  gameRecords={[]}
                  onGameRecordsUpdate={() => {}} // No longer needed
                  totalBetAmount={userProfile.total_bet_amount}
                  totalDepositAmount={userProfile.total_deposit_amount}
                  totalWithdrawAmount={userProfile.total_withdraw_amount}
                  onStatsUpdate={() => {}} // No longer needed - handled by backend
                />
              ) : (
                <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Setting up your profile...</p>
                  </div>
                </div>
              )
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
