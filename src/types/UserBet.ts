
export interface UserBet {
  period: string;
  betType: 'color' | 'number';
  betValue: string | number;
  amount: number;
  result?: 'win' | 'lose';
  payout?: number;
  timestamp: Date;
  gameType: string;
  gameMode?: string;
  id: string;
  settled: boolean;
}
