export type GameType = "Parity" | "Sapre" | "Bcone" | "Emerd";
export type GameMode = "Wingo1min" | "Wingo3min" | "Wingo5min";

const GAME_MODE_INTERVALS: Record<GameMode, number> = {
  Wingo1min: 1,
  Wingo3min: 3,
  Wingo5min: 5,
};

// ✅ Fixed: Consistent IST conversion
function toIST(date: Date): Date {
  const istOffset = 5.5 * 60; // 5.5 hours in minutes
  const utcTime = date.getTime(); // in ms
  return new Date(utcTime + istOffset * 60 * 1000);
}

// ✅ Generates unique period ID like 20250624135
export function generatePeriod(gameMode: GameMode, now = new Date()): string {
  const interval = GAME_MODE_INTERVALS[gameMode];
  const ist = toIST(now);

  const yyyy = ist.getFullYear();
  const mm = `${ist.getMonth() + 1}`.padStart(2, "0");
  const dd = `${ist.getDate()}`.padStart(2, "0");

  const totalMinutes = ist.getHours() * 60 + ist.getMinutes();
  const periodIndex = Math.floor(totalMinutes / interval)
    .toString()
    .padStart(3, "0");

  return `${yyyy}${mm}${dd}${periodIndex}`;
}

export function getPeriodStartTime(gameMode: GameMode, now = new Date()): Date {
  const interval = GAME_MODE_INTERVALS[gameMode];
  const ist = toIST(now);
  const offset = ist.getMinutes() % interval;

  ist.setMinutes(ist.getMinutes() - offset);
  ist.setSeconds(0);
  ist.setMilliseconds(0);

  return ist;
}

export function getPeriodEndTime(gameMode: GameMode, now = new Date()): Date {
  const start = getPeriodStartTime(gameMode, now);
  const interval = GAME_MODE_INTERVALS[gameMode];
  return new Date(start.getTime() + interval * 60 * 1000);
}
