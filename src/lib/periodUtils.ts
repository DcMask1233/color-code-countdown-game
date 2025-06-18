// lib/periodUtils.ts

export function getCurrentPeriod(gameType: string, duration: number): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  const totalMinutes = now.getHours() * 60 + now.getMinutes();
  const gameSlot = Math.floor(totalMinutes / duration);

  return `${yyyy}${mm}${dd}${gameSlot}`;
}
