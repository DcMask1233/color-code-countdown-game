export interface GameRecord {
  period: string;
  number: number;
  color: string[];
}

export interface GamePeriod {
  id: number;
  period: string;
  game_type: string;
  game_mode: string;
  start_time: string;
  end_time: string;
  is_locked: boolean;
  result?: any;
}

export type GameType = "Parity" | "Sapre" | "Bcone" | "Emerd";
export type GameMode = "wingo1min" | "wingo3min" | "wingo5min";
export type BetType = "color" | "number";