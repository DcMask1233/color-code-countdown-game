import { useState, useEffect } from "react";
import { LoginModal } from "@/components/auth/LoginModal";
import { CountdownTimer } from "@/components/game/CountdownTimer";
import { GameTabs } from "@/components/game/GameTabs";
import { ColorButtons } from "@/components/game/ColorButtons";
import { NumberGrid } from "@/components/game/NumberGrid";
import { BetPopup } from "@/components/game/BetPopup";
import { ParityRecord } from "@/components/game/ParityRecord";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userBalance, setUserBalance] = useState(1000);
  const [activeGameTab, setActiveGameTab] = useState('parity');
  const [activeBottomTab, setActiveBottomTab] = useState('home');
  const [showBetPopup, setShowBetPopup] = useState(false);
  const [selectedBetType, setSelectedBetType] = useState<'color' | 'number'>('color');
  const [selectedBetValue, setSelectedBetValue] = useState<string | number>('');
  const [gameRecords, setGameRecords] = useState([
    { period: '20240105001', number: 7, color: ['green'] },
    { period: '20240105002', number: 0, color: ['violet', 'red'] },
    { period: '20240105003', number: 5, color: ['violet', 'green'] },
    { period: '20240105004', number: 8, color: ['red'] },
    { period: '20240105005', number: 3, color: ['green'] },
  ]);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('colorGameUser');
    if (savedUser) {
      setIsLoggedIn(true);
      const userData = JSON.parse(savedUser);
      setUserBalance(userData.balance || 1000);
    }
  }, []);

  const handleLogin = (mobile: string) => {
    // Simulate successful login
    const userData = {
      mobile,
      balance: userBalance,
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
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  const handleColorSelect = (color: string) => {
    setSelectedBetType('color');
    setSelectedBetValue(color);
    setShowBetPopup(true);
  };

  const handleNumberSelect = (number: number) => {
    setSelectedBetType('number');
    setSelectedBetValue(number);
    setShowBetPopup(true);
  };

  const handleConfirmBet = (amount: number) => {
    // Deduct bet amount
    setUserBalance(prev => prev - amount);
    
    toast({
      title: "Bet Placed!",
      description: `₹${amount} bet placed on ${selectedBetType}: ${selectedBetValue}`,
    });
  };

  const handleRoundComplete = (newPeriod: string) => {
    // Generate random result for demo
    const winningNumber = Math.floor(Math.random() * 10);
    const getNumberColor = (num: number): string[] => {
      if (num === 0) return ["violet", "red"];
      if (num === 5) return ["violet", "green"];
      return num % 2 === 0 ? ["red"] : ["green"];
    };

    const newRecord = {
      period: newPeriod,
      number: winningNumber,
      color: getNumberColor(winningNumber)
    };

    setGameRecords(prev => [newRecord, ...prev.slice(0, 9)]);
  };

  const handleRecharge = () => {
    toast({
      title: "Recharge",
      description: "Recharge functionality coming soon!",
    });
  };

  const handleReadRules = () => {
    toast({
      title: "Rules",
      description: "Game rules will be displayed here!",
    });
  };

  const handleRefresh = () => {
    toast({
      title: "Refreshed",
      description: "Game data refreshed!",
    });
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
    <div className="min-h-screen bg-gray-100 pb-20">
      <Header
        balance={userBalance}
        onRecharge={handleRecharge}
        onReadRules={handleReadRules}
        onRefresh={handleRefresh}
      />

      <div className="container mx-auto px-4 py-4 max-w-md">
        {activeBottomTab === 'home' && (
          <>
            <GameTabs
              activeTab={activeGameTab}
              onTabChange={setActiveGameTab}
            />

            <CountdownTimer onRoundComplete={handleRoundComplete} />

            <ColorButtons onColorSelect={handleColorSelect} />

            <NumberGrid onNumberSelect={handleNumberSelect} />

            <ParityRecord records={gameRecords} />
          </>
        )}

        {activeBottomTab === 'my' && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">My Profile</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Balance:</span>
                <span className="font-semibold">₹{userBalance}</span>
              </div>
              <Button onClick={handleLogout} variant="outline" className="w-full">
                Logout
              </Button>
            </div>
          </div>
        )}

        {(activeBottomTab === 'search' || activeBottomTab === 'newgame' || activeBottomTab === 'win') && (
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <h2 className="text-xl font-bold mb-4 capitalize">{activeBottomTab}</h2>
            <p className="text-gray-600">This section is coming soon!</p>
          </div>
        )}
      </div>

      <BetPopup
        isOpen={showBetPopup}
        onClose={() => setShowBetPopup(false)}
        selectedType={selectedBetType}
        selectedValue={selectedBetValue}
        userBalance={userBalance}
        onConfirmBet={handleConfirmBet}
      />

      <BottomNavigation
        activeTab={activeBottomTab}
        onTabChange={setActiveBottomTab}
      />
    </div>
  );
};

export default Index;
