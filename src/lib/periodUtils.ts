// lib/periodUtils.ts

export type GameType = "Wingo1" | "Wingo3" | "Wingo5" | "Parity" | "Sapre" | "Bcone" | "Emerd";

const GAME_INTERVALS: Record<GameType, number> = {
  Wingo1: 1,
  Wingo3: 3,
  Wingo5: 5,
  Parity: 1,
  Sapre: 3,
  Bcone: 5,
  Emerd: 10,
};

/**
 * Converts a Date object to IST timezone components
 * without changing the original date object.
 */
function toIST(date: Date): Date {
  // IST is UTC +5:30
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + 5.5 * 60 * 60000);
}

/**
 * Generates period number string based on IST time.
 * Format: YYYYMMDD + 3 digit period number for the day
 */
export function generatePeriod(gameType: GameType, now = new Date()): string {
  const interval = GAME_INTERVALS[gameType];
  if (!interval) throw new Error("Unsupported game type");

  const istDate = toIST(now);
  const year = istDate.getFullYear();
  const month = `${istDate.getMonth() + 1}`.padStart(2, "0");
  const day = `${istDate.getDate()}`.padStart(2, "0");

  const totalMinutes = istDate.getHours() * 60 + istDate.getMinutes();
  const periodIndex = Math.floor(totalMinutes / interval);
  const periodNumber = `${periodIndex}`.padStart(3, "0");

  return `${year}${month}${day}${periodNumber}`;
}

/**
 * Get the period start time in IST timezone
 */
export function getPeriodStartTime(gameType: GameType, now = new Date()): Date {
  const interval = GAME_INTERVALS[gameType];
  const istDate = toIST(now);

  const start = new Date(istDate);
  const offset = start.getMinutes() % interval;

  start.setMinutes(start.getMinutes() - offset);
  start.setSeconds(0);
  start.setMilliseconds(0);

  return start;
}

/**
 * Get the period end time in IST timezone
 */
export function getPeriodEndTime(gameType: GameType, now = new Date()): Date {
  const start = getPeriodStartTime(gameType, now);
  const interval = GAME_INTERVALS[gameType];

  return new Date(start.getTime() + interval * 60 * 1000);
}

