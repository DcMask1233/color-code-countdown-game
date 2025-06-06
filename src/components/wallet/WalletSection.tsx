
import { ArrowLeft, Wallet, Home, Star, User } from "lucide-react";
import { WalletStatsCard } from "./WalletStatsCard";
import { WalletActionButton } from "./WalletActionButton";

interface WalletSectionProps {
  userBalance: number;
  totalBetAmount: number;
  totalDepositAmount: number;
  totalWithdrawAmount: number;
  onBack: () => void;
  onDeposit: () => void;
  onWithdraw: () => void;
  onDepositHistory: () => void;
  onWithdrawHistory: () => void;
}

export const WalletSection = ({
  userBalance,
  totalBetAmount,
  totalDepositAmount,
  totalWithdrawAmount,
  onBack,
  onDeposit,
  onWithdraw,
  onDepositHistory,
  onWithdrawHistory
}: WalletSectionProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700">
      {/* Header */}
      <div className="flex items-center p-4 text-white">
        <button onClick={onBack} className="mr-4 p-2 hover:bg-white/10 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <Wallet size={24} />
          <h1 className="text-xl font-semibold">Wallet</h1>
        </div>
      </div>

      {/* Balance Display */}
      <div className="px-4 py-6 text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <Wallet size={32} className="text-white" />
        </div>
        <p className="text-white/80 text-sm mb-2">Total Balance</p>
        <p className="text-white text-3xl font-bold">₹{userBalance.toFixed(2)}</p>
      </div>

      {/* Stats Cards */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <WalletStatsCard title="Total Balance" amount={userBalance} />
          <WalletStatsCard title="Total Bet Amount" amount={totalBetAmount} />
          <WalletStatsCard title="Total Deposit Amount" amount={totalDepositAmount} />
          <WalletStatsCard title="Total Withdraw Amount" amount={totalWithdrawAmount} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-4">
          <WalletActionButton
            title="Deposit"
            icon={Home}
            color="bg-orange-500"
            onClick={onDeposit}
          />
          <WalletActionButton
            title="Withdraw"
            icon={Star}
            color="bg-blue-500"
            onClick={onWithdraw}
          />
          <WalletActionButton
            title="Deposit History"
            icon={User}
            color="bg-red-500"
            onClick={onDepositHistory}
          />
          <WalletActionButton
            title="Withdrawal History"
            icon={Wallet}
            color="bg-green-500"
            onClick={onWithdrawHistory}
          />
        </div>
      </div>
    </div>
  );
};
