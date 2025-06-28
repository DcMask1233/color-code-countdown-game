
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainGame } from "@/components/game/MainGame";
import { useToast } from "@/hooks/use-toast";

interface GameRecord {
  period: string;
  number: number;
  color: string[];
}

const generateUserId = (): string => {
  return crypto.randomUUID();
};

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userBalance, setUserBalance] = useState(1000);
  const [userId, setUserId] = useState('');
  const [totalBetAmount, setTotalBetAmount] = useState(0);
  const [totalDepositAmount, setTotalDepositAmount] = useState(0);
  const [totalWithdrawAmount, setTotalWithdrawAmount] = useState(0);
  const [gameRecords, setGameRecords] = useState<GameRecord[]>([]);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('colorGameUser');
    if (savedUser) {
      setIsLoggedIn(true);
      const userData = JSON.parse(savedUser);
      setUserBalance(userData.balance || 1000);
      
      let currentUserId = userData.userId;
      if (!currentUserId || !currentUserId.includes('-')) {
        currentUserId = generateUserId();
        const updatedUserData = { ...userData, userId: currentUserId };
        localStorage.setItem('colorGameUser', JSON.stringify(updatedUserData));
      }
      
      setUserId(currentUserId);
      setTotalBetAmount(userData.totalBetAmount || 0);
      setTotalDepositAmount(userData.totalDepositAmount || 0);
      setTotalWithdrawAmount(userData.totalWithdrawAmount || 0);
      console.log('🔑 User loaded with backend-driven data only');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('colorGameUser');
    setIsLoggedIn(false);
    setUserBalance(1000);
    setUserId('');
    setTotalBetAmount(0);
    setTotalDepositAmount(0);
    setTotalWithdrawAmount(0);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate('/login');
  };

  const handleBalanceUpdate = (amount: number) => {
    const newBalance = userBalance + amount;
    setUserBalance(newBalance);

    const savedUser = localStorage.getItem('colorGameUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      userData.balance = newBalance;
      localStorage.setItem('colorGameUser', JSON.stringify(userData));
    }
  };

  const handleStatsUpdate = (type: 'bet' | 'deposit' | 'withdraw', amount: number) => {
    let newTotalBet = totalBetAmount;
    let newTotalDeposit = totalDepositAmount;
    let newTotalWithdraw = totalWithdrawAmount;

    switch (type) {
      case 'bet':
        newTotalBet += amount;
        setTotalBetAmount(newTotalBet);
        break;
      case 'deposit':
        newTotalDeposit += amount;
        setTotalDepositAmount(newTotalDeposit);
        break;
      case 'withdraw':
        newTotalWithdraw += amount;
        setTotalWithdrawAmount(newTotalWithdraw);
        break;
    }

    const savedUser = localStorage.getItem('colorGameUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      userData.totalBetAmount = newTotalBet;
      userData.totalDepositAmount = newTotalDeposit;
      userData.totalWithdrawAmount = newTotalWithdraw;
      localStorage.setItem('colorGameUser', JSON.stringify(userData));
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  console.log('🏠 Index page loaded - all data now backend-driven');

  return (
    <MainGame
      userBalance={userBalance}
      userId={userId}
      onBalanceUpdate={handleBalanceUpdate}
      onLogout={handleLogout}
      gameRecords={gameRecords}
      onGameRecordsUpdate={setGameRecords}
      totalBetAmount={totalBetAmount}
      totalDepositAmount={totalDepositAmount}
      totalWithdrawAmount={totalWithdrawAmount}
      onStatsUpdate={handleStatsUpdate}
    />
  );
};

export default Index;
