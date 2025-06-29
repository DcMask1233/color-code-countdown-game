import { RefreshCcw, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface HomeHeaderProps {
  balance: number;
  userId: string;
  onRecharge: () => void;
  onWithdraw: () => void;
  onRefresh: () => void;
}

export const HomeHeader = ({
  balance,
  userId,
  onRecharge,
  onWithdraw,
  onRefresh
}: HomeHeaderProps) => {
  const { signOut, refreshProfile } = useAuth();

  const handleRefresh = async () => {
    await refreshProfile();
    onRefresh();
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="bg-white p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-600">
          ID: {userId}
        </div>
        <Button 
          onClick={handleLogout}
          size="sm"
          variant="ghost"
          className="text-gray-500 hover:text-red-600"
        >
          <LogOut size={16} />
        </Button>
      </div>
      
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-700 text-sm">Balance</span>
            <button onClick={handleRefresh} className="p-1 hover:bg-gray-100 rounded">
              <RefreshCcw size={14} className="text-gray-500" />
            </button>
          </div>
          <span className="text-2xl font-bold text-black">₹{balance.toFixed(2)}</span>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button 
            onClick={onRecharge} 
            size="sm" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2"
          >
            Recharge
          </Button>
          <Button 
            onClick={onWithdraw} 
            size="sm" 
            variant="outline"
            className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Withdraw
          </Button>
        </div>
      </div>
    </div>
  );
};
