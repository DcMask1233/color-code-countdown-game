// lib/gameUtils.ts
export const getDurationFromGameMode = (mode: "Wingo1min" | "Wingo3min" | "Wingo5min"): number => {
  switch (mode) {
    case "Wingo1min": return 1;
    case "Wingo3min": return 3;
    case "Wingo5min": return 5;
    default: return 1;
  }
};
