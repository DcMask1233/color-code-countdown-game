
import { useState, useEffect } from "react";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { MainGame } from "@/components/game/MainGame";
import { useToast } from "@/hooks/use-toast";

interface GameRecord {
  period: string;
  number: number;
  color: string[];
}

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userBalance, setUserBalance] = useState(1000);
  const [gameRecords, setGameRecords] = useState<GameRecord[]>([
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

  const handleBalanceUpdate = (amount: number) => {
    setUserBalance(prev => prev + amount);
  };

  if (!isLoggedIn) {
    return (
      <LoginScreen
        showLoginModal={showLoginModal}
        onShowLoginModal={() => setShowLoginModal(true)}
        onCloseLoginModal={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <MainGame
      userBalance={userBalance}
      onBalanceUpdate={handleBalanceUpdate}
      onLogout={handleLogout}
      gameRecords={gameRecords}
      onGameRecordsUpdate={setGameRecords}
    />
  );
};

export default Index;
