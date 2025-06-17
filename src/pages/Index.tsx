import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainGame } from "@/components/game/MainGame";
import { AutoResultGenerator } from "@/components/game/AutoResultGenerator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
      setUserId(userData.userId || generateUserId());
      setTotalBetAmount(userData.totalBetAmount || 0);
      setTotalDepositAmount(userData.totalDepositAmount || 0);
      setTotalWithdrawAmount(userData.totalWithdrawAmount || 0);
    } else {
      // Redirect to login if not authenticated
      navigate('/login');
    }
  }, [navigate]);

  // Fetch game results from Supabase every 30 seconds
  useEffect(() => {
    const fetchGameResults = async () => {
      const { data, error } = await supabase
        .from('game_results')
        .select('*')
        .order('period', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Failed to fetch game results:', error);
        return;
      }

      if (data) {
        // Assuming data matches GameRecord interface or can be mapped accordingly
        const mappedRecords = data.map((item: any) => ({
          period: item.period,
          number: item.number,
          color: item.result_color || [], // adjust key if different
        }));
        setGameRecords(mappedRecords);
      }
    };

    fetchGameResults();

    const interval = setInterval(fetchGameResults, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

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
        newTotalBet = totalBetAmount + amount;
        setTotalBetAmount(newTotalBet);
        break;
      case 'deposit':
        newTotalDeposit = totalDepositAmount + amount;
        setTotalDepositAmount(newTotalDeposit);
        break;
      case 'withdraw':
        newTotalWithdraw = totalWithdrawAmount + amount;
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
    return null; // or a loading spinner if you want
  }

  return (
    <>
      <AutoResultGenerator />
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
    </>
  );
};

export default Index;
