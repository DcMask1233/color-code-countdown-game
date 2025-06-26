import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseSupabasePeriodReturn {
  currentPeriod: string;
  timeLeft: number;
  isLoading: boolean;
  error: string | null;
}

export const useSupabasePeriod = (
  gameType: string,
  duration: number
): UseSupabasePeriodReturn => {
  const [currentPeriod, setCurrentPeriod] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPeriodInfo = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc("generate_period_info", {
        p_game_type: gameType,
        p_duration: duration,
      });

      if (error || !data) {
        console.error("❌ Error fetching period info:", error);
        setError(error?.message ?? "No data returned");
        return;
      }

      setCurrentPeriod(data.period);
      setTimeLeft(data.time_left);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      console.error("💥 Exception in fetchPeriodInfo:", err);
      setError("Failed to fetch period info");
      setIsLoading(false);
    }
  }, [gameType, duration]);

  useEffect(() => {
    fetchPeriodInfo(); // Initial load

    const interval = setInterval(() => {
      fetchPeriodInfo(); // Re-poll every 3 seconds
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchPeriodInfo]);

  return {
    currentPeriod,
    timeLeft,
    isLoading,
    error,
  };
};
