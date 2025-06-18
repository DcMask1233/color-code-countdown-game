export function getCurrentPeriod(gameType: string, duration: number): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  // Calculate how many full "duration" slots have passed since 00:00 today
  const totalMinutes = now.getHours() * 60 + now.getMinutes();
  const periodNumber = Math.floor(totalMinutes / duration);

  // Pad the period number to always have 3 digits (e.g. 001, 045, 123)
  const periodStr = String(periodNumber).padStart(3, "0");

  return `${yyyy}${mm}${dd}${periodStr}`;
}
