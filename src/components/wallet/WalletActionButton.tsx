
import { LucideIcon } from "lucide-react";

interface WalletActionButtonProps {
  title: string;
  icon: LucideIcon;
  color: string;
  onClick: () => void;
}

export const WalletActionButton = ({ title, icon: Icon, color, onClick }: WalletActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg p-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors"
    >
      <div className={`p-3 rounded-full ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <span className="text-gray-700 text-sm font-medium">{title}</span>
    </button>
  );
};
