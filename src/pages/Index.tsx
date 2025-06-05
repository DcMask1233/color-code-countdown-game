
import { useState, useEffect } from "react";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { MainGame } from "@/components/game/MainGame";
import { useToast } from "@/hooks/use-toast";

interface GameRecord {
  period: string;
  number: number;
  color: string[];
}

const generateUserId = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userBalance, setUserBalance] = useState(1000);
  const [userId, setUserId] = useState('');
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
      setUserId(userData.userId || generateUserId());
    }
  }, []);

  const handleLogin = (mobile: string) => {
    // Generate unique user ID for new user
    const newUserId = generateUserId();
    
    // Simulate successful login
    const userData = {
      mobile,
      balance: userBalance,
      userId: newUserId,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('colorGameUser', JSON.stringify(userData));
    setIsLoggedIn(true);
    setUserId(newUserId);
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
    setUserId('');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  const handleBalanceUpdate = (amount: number) => {
    const newBalance = userBalance + amount;
    setUserBalance(newBalance);
    
    // Update localStorage
    const savedUser = localStorage.getItem('colorGameUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      userData.balance = newBalance;
      localStorage.setItem('colorGameUser', JSON.stringify(userData));
    }
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
      userId={userId}
      onBalanceUpdate={handleBalanceUpdate}
      onLogout={handleLogout}
      gameRecords={gameRecords}
      onGameRecordsUpdate={setGameRecords}
    />
  );
};

export default Index;
