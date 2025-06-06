
interface WalletStatsCardProps {
  title: string;
  amount: number;
}

export const WalletStatsCard = ({ title, amount }: WalletStatsCardProps) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
      <p className="text-white/80 text-sm mb-1">{title}</p>
      <p className="text-white font-semibold text-lg">₹{amount.toFixed(2)}</p>
    </div>
  );
};
