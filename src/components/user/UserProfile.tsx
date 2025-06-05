
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface UserProfileProps {
  balance: number;
  onBalanceUpdate: (amount: number) => void;
}

export const UserProfile = ({ balance, onBalanceUpdate }: UserProfileProps) => {
  const [addAmount, setAddAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const { toast } = useToast();

  const handleAddMoney = () => {
    const amount = parseInt(addAmount);
    if (amount <= 0 || amount > 10000) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be between ₹1 and ₹10,000",
        variant: "destructive",
      });
      return;
    }

    onBalanceUpdate(amount);
    setAddAmount("");
    toast({
      title: "Money Added!",
      description: `₹${amount} has been added to your wallet`,
    });
  };

  const handleWithdraw = () => {
    const amount = parseInt(withdrawAmount);
    if (amount <= 0 || amount > balance) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be between ₹1 and your current balance",
        variant: "destructive",
      });
      return;
    }

    onBalanceUpdate(-amount);
    setWithdrawAmount("");
    toast({
      title: "Withdrawal Successful!",
      description: `₹${amount} has been withdrawn from your wallet`,
    });
  };

  const userData = JSON.parse(localStorage.getItem('colorGameUser') || '{}');

  return (
    <div className="space-y-6">
      {/* User Info */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {userData.mobile ? userData.mobile.slice(-2) : "U"}
              </span>
            </div>
            <p className="text-white font-semibold">
              +91 {userData.mobile || "XXXXXXXXXX"}
            </p>
            <p className="text-white/60 text-sm">
              Member since {userData.loginTime ? new Date(userData.loginTime).toLocaleDateString() : "Today"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Balance Card */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center">Wallet Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-4xl font-bold text-white mb-2">₹{balance}</p>
            <p className="text-white/60 text-sm">Available Balance</p>
          </div>
        </CardContent>
      </Card>

      {/* Add Money */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center">Add Money</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="addAmount" className="text-white">Amount to Add</Label>
            <Input
              id="addAmount"
              type="number"
              placeholder="Enter amount (₹1 - ₹10,000)"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              min="1"
              max="10000"
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[100, 500, 1000, 2000].map((amount) => (
              <Button
                key={amount}
                onClick={() => setAddAmount(amount.toString())}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                ₹{amount}
              </Button>
            ))}
          </div>

          <Button
            onClick={handleAddMoney}
            disabled={!addAmount || parseInt(addAmount) <= 0}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
          >
            Add Money
          </Button>
        </CardContent>
      </Card>

      {/* Withdraw Money */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center">Withdraw Money</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="withdrawAmount" className="text-white">Amount to Withdraw</Label>
            <Input
              id="withdrawAmount"
              type="number"
              placeholder={`Enter amount (₹1 - ₹${balance})`}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              min="1"
              max={balance}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => setWithdrawAmount(Math.floor(balance / 2).toString())}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              disabled={balance < 2}
            >
              Half
            </Button>
            <Button
              onClick={() => setWithdrawAmount(balance.toString())}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              disabled={balance <= 0}
            >
              All
            </Button>
          </div>

          <Button
            onClick={handleWithdraw}
            disabled={!withdrawAmount || parseInt(withdrawAmount) <= 0 || parseInt(withdrawAmount) > balance}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            Withdraw Money
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
