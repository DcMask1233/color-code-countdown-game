
export function getCurrentPeriod(gameType: string, duration: number): string {
  const now = new Date();
  // Use IST time (UTC + 5.5 hours) for consistency
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  
  const yyyy = istTime.getFullYear();
  const mm = String(istTime.getMonth() + 1).padStart(2, "0");
  const dd = String(istTime.getDate()).padStart(2, "0");

  // Calculate how many full "duration" slots have passed since 00:00 IST today
  const startOfDay = new Date(istTime);
  startOfDay.setHours(0, 0, 0, 0);
  const secondsSinceStart = Math.floor((istTime.getTime() - startOfDay.getTime()) / 1000);
  const periodNumber = Math.floor(secondsSinceStart / duration) + 1;

  // Pad the period number to always have 3 digits
  const periodStr = String(periodNumber).padStart(3, "0");

  return `${yyyy}${mm}${dd}${periodStr}`;
}
