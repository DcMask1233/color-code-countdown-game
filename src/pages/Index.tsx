
import { useState, useEffect } from "react";
import { LoginModal } from "@/components/auth/LoginModal";
import { GameBoard } from "@/components/game/GameBoard";
import { UserProfile } from "@/components/user/UserProfile";
import { GameHistory } from "@/components/game/GameHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userBalance, setUserBalance] = useState(1000);
  const [gameHistory, setGameHistory] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('colorGameUser');
    if (savedUser) {
      setIsLoggedIn(true);
      const userData = JSON.parse(savedUser);
      setUserBalance(userData.balance || 1000);
      setGameHistory(userData.history || []);
    }
  }, []);

  const handleLogin = (mobile: string) => {
    // Simulate successful login
    const userData = {
      mobile,
      balance: userBalance,
      history: gameHistory,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('colorGameUser', JSON.stringify(userData));
    setIsLoggedIn(true);
    setShowLoginModal(false);
    toast({
      title: "Login Successful!",
      description: "Welcome to Color Prediction Game",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('colorGameUser');
    setIsLoggedIn(false);
    setUserBalance(1000);
    setGameHistory([]);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  const updateBalance = (amount: number) => {
    const newBalance = userBalance + amount;
    setUserBalance(newBalance);
    
    // Update localStorage
    const savedUser = JSON.parse(localStorage.getItem('colorGameUser') || '{}');
    savedUser.balance = newBalance;
    localStorage.setItem('colorGameUser', JSON.stringify(savedUser));
  };

  const addGameResult = (result: any) => {
    const newHistory = [result, ...gameHistory].slice(0, 50); // Keep last 50 games
    setGameHistory(newHistory);
    
    // Update localStorage
    const savedUser = JSON.parse(localStorage.getItem('colorGameUser') || '{}');
    savedUser.history = newHistory;
    localStorage.setItem('colorGameUser', JSON.stringify(savedUser));
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md w-full">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">Color Prediction</h1>
            <p className="text-xl text-purple-200">Win Big with Colors!</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 space-y-4">
            <div className="flex justify-center space-x-4">
              <div className="w-8 h-8 bg-red-500 rounded-full animate-pulse"></div>
              <div className="w-8 h-8 bg-green-500 rounded-full animate-pulse delay-75"></div>
              <div className="w-8 h-8 bg-violet-500 rounded-full animate-pulse delay-150"></div>
            </div>
            
            <p className="text-white/80 text-sm">
              Predict colors and numbers to win amazing rewards!
            </p>
            
            <Button 
              onClick={() => setShowLoginModal(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Login with Mobile OTP
            </Button>
          </div>
        </div>

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Color Game</h1>
          <Button 
            onClick={handleLogout}
            variant="outline" 
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Logout
          </Button>
        </div>

        <Tabs defaultValue="game" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-md">
            <TabsTrigger value="game" className="text-white data-[state=active]:bg-white/20">Game</TabsTrigger>
            <TabsTrigger value="profile" className="text-white data-[state=active]:bg-white/20">Profile</TabsTrigger>
            <TabsTrigger value="history" className="text-white data-[state=active]:bg-white/20">History</TabsTrigger>
          </TabsList>

          <TabsContent value="game">
            <GameBoard 
              userBalance={userBalance}
              onBalanceUpdate={updateBalance}
              onGameResult={addGameResult}
            />
          </TabsContent>

          <TabsContent value="profile">
            <UserProfile 
              balance={userBalance}
              onBalanceUpdate={updateBalance}
            />
          </TabsContent>

          <TabsContent value="history">
            <GameHistory history={gameHistory} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
