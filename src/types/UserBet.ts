
export interface UserBet {
  period: string;
  betType: 'color' | 'number';
  betValue: string | number;
  amount: number;
  result?: 'win' | 'lose';
  payout?: number;
  timestamp: Date;
  gameType: string; // Added gameType for better filtering
  gameMode?: string; // Added gameMode to distinguish between different time intervals
}
