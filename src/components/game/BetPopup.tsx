
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BetPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedType: 'color' | 'number';
  selectedValue: string | number;
  userBalance: number;
  onConfirmBet: (amount: number) => void;
}

export const BetPopup = ({ 
  isOpen, 
  onClose, 
  selectedType, 
  selectedValue, 
  userBalance, 
  onConfirmBet 
}: BetPopupProps) => {
  const [betAmount, setBetAmount] = useState("10");

  if (!isOpen) return null;

  const handleConfirm = () => {
    const amount = parseInt(betAmount);
    if (amount > 0 && amount <= userBalance) {
      onConfirmBet(amount);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-4 text-center">
          Confirm Bet
        </h3>
        
        <div className="mb-4 text-center">
          <p className="text-gray-600">
            {selectedType === 'color' ? 'Color' : 'Number'}: {' '}
            <span className="font-semibold capitalize">
              {selectedValue}
            </span>
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bet Amount
          </label>
          <Input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            placeholder="Enter amount"
            min="1"
            max={userBalance}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Available balance: ₹{userBalance}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {[10, 50, 100, 500].map((amount) => (
            <Button
              key={amount}
              onClick={() => setBetAmount(amount.toString())}
              variant="outline"
              size="sm"
              disabled={amount > userBalance}
              className="text-xs"
            >
              ₹{amount}
            </Button>
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-blue-500 hover:bg-blue-600"
            disabled={!betAmount || parseInt(betAmount) <= 0 || parseInt(betAmount) > userBalance}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};
