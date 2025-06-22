// lib/periodUtils.ts

export type GameType = "Wingo1" | "Wingo3" | "Wingo5" | "Parity" | "Sapre" | "Bcone" | "Emerd";

// Duration in minutes for each game type
const GAME_INTERVALS: Record<GameType, number> = {
  Wingo1: 1,
  Wingo3: 3,
  Wingo5: 5,
  Parity: 1,
  Sapre: 3,
  Bcone: 5,
  Emerd: 10,
};

// Convert UTC to IST (without altering the input date object)
function toIST(date: Date): Date {
  const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utcTime + 5.5 * 60 * 60000);
}

// ✅ Generate current period number in format: YYYYMMDD + 3-digit period count
export function generatePeriod(gameType: GameType, now = new Date()): string {
  const interval = GAME_INTERVALS[gameType];
  if (!interval) throw new Error(`Unsupported game type: ${gameType}`);

  const ist = toIST(now);
  const yyyy = ist.getFullYear();
  const mm = `${ist.getMonth() + 1}`.padStart(2, "0");
  const dd = `${ist.getDate()}`.padStart(2, "0");

  const minutes = ist.getHours() * 60 + ist.getMinutes();
  const periodIndex = Math.floor(minutes / interval).toString().padStart(3, "0");

  return `${yyyy}${mm}${dd}${periodIndex}`;
}

// ✅ Get exact start time of the current period (IST)
export function getPeriodStartTime(gameType: GameType, now = new Date()): Date {
  const interval = GAME_INTERVALS[gameType];
  const ist = toIST(now);
  const offsetMinutes = ist.getMinutes() % interval;

  ist.setMinutes(ist.getMinutes() - offsetMinutes);
  ist.setSeconds(0);
  ist.setMilliseconds(0);

  return ist;
}

// ✅ Get exact end time of the current period (IST)
export function getPeriodEndTime(gameType: GameType, now = new Date()): Date {
  const start = getPeriodStartTime(gameType, now);
  const interval = GAME_INTERVALS[gameType];
  return new Date(start.getTime() + interval * 60 * 1000);
}
