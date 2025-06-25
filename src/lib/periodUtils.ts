export type GameType = "Parity" | "Sapre" | "Bcone" | "Emerd";
export type GameMode = "Wingo1min" | "Wingo3min" | "Wingo5min";

const GAME_MODE_INTERVALS: Record<GameMode, number> = {
  Wingo1min: 1,
  Wingo3min: 3,
  Wingo5min: 5,
};

// 🔄 Optional: use this only in UI display
export function toIST(date: Date): Date {
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  return new Date(date.getTime() + istOffsetMs);
}

// ✅ Generates unique period ID based on UTC (for global consistency)
export function generatePeriod(gameMode: GameMode, now: Date = new Date()): string {
  const interval = GAME_MODE_INTERVALS[gameMode];

  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");

  const totalMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const periodIndex = Math.floor(totalMinutes / interval).toString().padStart(3, "0");

  return `${yyyy}${mm}${dd}${periodIndex}`;
}

// ✅ Start time of current period (UTC)
export function getPeriodStartTime(gameMode: GameMode, now: Date = new Date()): Date {
  const interval = GAME_MODE_INTERVALS[gameMode];
  const minutes = now.getUTCMinutes();
  const offset = minutes % interval;

  const start = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    minutes - offset,
    0,
    0
  ));

  return start;
}

// ✅ End time of current period (UTC)
export function getPeriodEndTime(gameMode: GameMode, now: Date = new Date()): Date {
  const start = getPeriodStartTime(gameMode, now);
  return new Date(start.getTime() + GAME_MODE_INTERVALS[gameMode] * 60 * 1000);
}
