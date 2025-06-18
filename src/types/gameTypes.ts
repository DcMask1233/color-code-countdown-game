export interface UserBet {
  period: string;
  betType: "number" | "color";
  betValue: string | number;
  amount: number;
  timestamp: Date;  // Use Date type here consistently
}
