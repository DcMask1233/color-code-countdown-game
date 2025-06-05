
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  balance: number;
  onRecharge: () => void;
  onReadRules: () => void;
  onRefresh: () => void;
}

export const Header = ({ balance, onRecharge, onReadRules, onRefresh }: HeaderProps) => {
  return (
    <div className="bg-blue-500 text-white p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="text-sm">Available balance: ₹{balance.toFixed(2)}</span>
        <Button
          onClick={onRecharge}
          size="sm"
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-xs"
        >
          Recharge
        </Button>
        <Button
          onClick={onReadRules}
          size="sm"
          variant="outline"
          className="border-white text-white hover:bg-white hover:text-blue-500 px-3 py-1 text-xs"
        >
          Read Rule
        </Button>
      </div>
      
      <button onClick={onRefresh} className="p-1 hover:bg-blue-600 rounded">
        <RefreshCcw size={16} />
      </button>
    </div>
  );
};
