import { supabase } from "@/integrations/supabase/client";

/**
 * Format time in seconds to MM:SS format
 */
export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

/**
 * Get period ID for betting - handles period creation via backend
 */
export const getPeriodIdForBetting = async (duration: number): Promise<number> => {
  try {
    const { data: periodInfo } = await supabase.rpc('get_current_game_period', { 
      p_duration: duration 
    });
    return periodInfo?.[0]?.period ? 1 : 1; // Backend handles period creation
  } catch (error) {
    console.error('Error getting period for betting:', error);
    return 1; // Fallback - backend will handle
  }
};

/**
 * Check if betting is closed based on time left and period status
 */
export const isBettingClosed = (timeLeft: number, isLocked?: boolean): boolean => {
  return timeLeft <= 5 || Boolean(isLocked);
};