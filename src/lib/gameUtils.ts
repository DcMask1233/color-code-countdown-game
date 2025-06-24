// lib/gameUtils.ts

/**
 * Returns duration in minutes based on the game mode.
 */
export const getDurationFromGameMode = (
  mode: "Wingo1min" | "Wingo3min" | "Wingo5min"
): number => {
  switch (mode) {
    case "Wingo1min":
      return 1;
    case "Wingo3min":
      return 3;
    case "Wingo5min":
      return 5;
    default:
      return 1; // Fallback safety
  }
};

/**
 * Returns the color(s) associated with a given number.
 * - 0 → violet + red
 * - 5 → violet + green
 * - even → red
 * - odd → green
 */
export const getNumberColor = (num: number): string[] => {
  if (num === 0) return ["violet", "red"];
  if (num === 5) return ["violet", "green"];
  return num % 2 === 0 ? ["red"] : ["green"];
};
