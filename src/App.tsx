
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/useAuth";
import { AuthPage } from "@/components/auth/AuthPage";
import { MainGame } from "@/components/game/MainGame";
import { ErrorBoundary } from "@/components/game/ErrorBoundary";
import AdminPanel from "@/pages/admin/index";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

function App() {
  const { user, userProfile, loading, authError, refreshProfile } = useAuth();

  console.log('App render state:', { 
    user: !!user, 
    userProfile: !!userProfile, 
    loading, 
    authError: !!authError 
  });

  // Show error state if auth failed
  if (authError && !loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <Alert className="mb-4">
            <AlertDescription>
              {authError}
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
            <Button 
              onClick={refreshProfile} 
              variant="outline" 
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    console.log('App is loading...');
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Loading application...</p>
          <p className="text-sm text-gray-500">This should only take a few seconds</p>
        </div>
      </div>
    );
  }

  console.log('App finished loading, rendering routes');

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Admin Routes */}
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
                    userId={userProfile.id}
                    onBalanceUpdate={() => {}} // Handled by secure backend
                    onLogout={() => {}} // Will be handled by MainGame
                    gameRecords={[]}
                    onGameRecordsUpdate={() => {}} // No longer needed
                    totalBetAmount={0} // Will be calculated from transactions
                    totalDepositAmount={0} // Will be calculated from transactions
                    totalWithdrawAmount={0} // Will be calculated from transactions
                    onStatsUpdate={() => {}} // Handled by secure backend
                  />
                ) : (
                  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Setting up your profile...</p>
                      <Button 
                        onClick={refreshProfile} 
                        variant="outline" 
                        size="sm"
                        className="mt-2"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                      </Button>
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
    </ErrorBoundary>
  );
}

export default App;
