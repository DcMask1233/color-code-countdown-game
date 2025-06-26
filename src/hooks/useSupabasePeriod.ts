import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useSupabasePeriod(durationSeconds: number) {
  const [currentPeriod, setCurrentPeriod] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(durationSeconds);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    async function fetchCurrentPeriod() {
      try {
        setIsLoading(true);
        const now = Math.floor(Date.now() / 1000);
        // Calculate the period based on current time and duration, or fetch from your backend

        // Example: fetch latest period from Supabase game_results table
        const { data, error } = await supabase
          .from("game_results")
          .select("period")
          .order("period", { ascending: false })
          .limit(1)
          .single();

        if (error) {
          throw error;
        }

        if (data?.period) {
          setCurrentPeriod(data.period);
          // calculate timeLeft based on your backend logic, here just a placeholder
          setTimeLeft(durationSeconds - (now % durationSeconds));
        }

        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to fetch period");
        setIsLoading(false);
      }
    }

    fetchCurrentPeriod();

    timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          fetchCurrentPeriod(); // refresh period when countdown ends
          return durationSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [durationSeconds]);

  return { currentPeriod, timeLeft, isLoading, error };
}
