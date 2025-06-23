// lib/periodUtils.ts

// These are the actual frontend game types shown to the user
export type GameType = "Parity" | "Sapre" | "Bcone" | "Emerd";

// Modes from tab/pages
export type GameMode = "Wingo1min" | "Wingo3min" | "Wingo5min";

// Map game mode to duration in minutes
const GAME_MODE_INTERVALS: Record<GameMode, number> = {
  Wingo1min: 1,
  Wingo3min: 3,
  Wingo5min: 5,
};

// Convert UTC to IST time
function toIST(date: Date): Date {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + 5.5 * 60 * 60000);
}

// Generates period string like 20250622135
export function generatePeriod(gameMode: GameMode, now = new Date()): string {
  const interval = GAME_MODE_INTERVALS[gameMode];
  const ist = toIST(now);

  const yyyy = ist.getFullYear();
  const mm = `${ist.getMonth() + 1}`.padStart(2, "0");
  const dd = `${ist.getDate()}`.padStart(2, "0");

  const minutes = ist.getHours() * 60 + ist.getMinutes();
  const periodIndex = Math.floor(minutes / interval).toString().padStart(3, "0");

  return `${yyyy}${mm}${dd}${periodIndex}`;
}

// Get period start time based on gameMode (in IST)
export function getPeriodStartTime(gameMode: GameMode, now = new Date()): Date {
  const interval = GAME_MODE_INTERVALS[gameMode];
  const ist = toIST(now);
  const offset = ist.getMinutes() % interval;

  ist.setMinutes(ist.getMinutes() - offset);
  ist.setSeconds(0);
  ist.setMilliseconds(0);

  return ist;
}

// Get end time based on gameMode (in IST)
export function getPeriodEndTime(gameMode: GameMode, now = new Date()): Date {
  const start = getPeriodStartTime(gameMode, now);
  const interval = GAME_MODE_INTERVALS[gameMode];
  return new Date(start.getTime() + interval * 60 * 1000);
}
