
export interface UserBet {
  id: string;
  period_id?: number;
  period: string;
  betType: 'color' | 'number';
  bet_type: 'color' | 'number';
  betValue: string | number;
  bet_value: string | number;
  amount: number;
  result?: 'win' | 'lose' | null;
  payout?: number;
  timestamp: Date;
  created_at?: string;
  gameType: string;
  gameMode: string; // Made required to fix the type error
  settled: boolean;
}
