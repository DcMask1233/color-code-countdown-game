
// lib/gameUtils.ts
import { GameMode } from "@/types/Game";

/**
 * Returns duration in seconds based on the game mode.
 * FIXED: Now returns seconds instead of minutes
 */
export const getDurationFromGameMode = (
  mode: GameMode
): number => {
  switch (mode) {
    case "wingo1min":
      return 60; // 1 minute = 60 seconds
    case "wingo3min":
      return 180; // 3 minutes = 180 seconds
    case "wingo5min":
      return 300; // 5 minutes = 300 seconds
    default:
      return 60; // Fallback safety
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
