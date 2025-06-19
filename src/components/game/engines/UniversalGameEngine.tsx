import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  generatePeriod,
  getPeriodEndTime,
  GameType,
} from "@/lib/periodUtils";

interface UniversalGameEngineProps {
  gameType: GameType;
}

export default function UniversalGameEngine({ gameType }: UniversalGameEngineProps) {
  const [currentPeriod, setCurrentPeriod] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(0);
  const [resultNumber, setResultNumber] = useState<number | null>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  // Update current period and countdown every second
  useEffect(() => {
    const updatePeriodAndCountdown = () => {
      const now = new Date();
      const period = generatePeriod(gameType, now);
      setCurrentPeriod(period);

      const periodEnd = getPeriodEndTime(gameType, now);
      const secondsLeft = Math.floor((periodEnd.getTime() - now.getTime()) / 1000);
      setCountdown(secondsLeft > 0 ? secondsLeft : 0);
    };

    updatePeriodAndCountdown();

    countdownInterval.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          updatePeriodAndCountdown();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [gameType]);

  // Listen for real-time new game results matching current period & gameType
  useEffect(() => {
    const channel = supabase
      .channel("game_results")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "game_results" },
        (payload) => {
          if (
            payload.new.game_type === gameType &&
            payload.new.period === currentPeriod
          ) {
            setResultNumber(payload.new.result_number);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameType, currentPeriod]);

  // When countdown reaches zero, generate or fetch result
  useEffect(() => {
    if (countdown !== 0) return;

    async function generateOrFetchResult() {
      try {
        // Check admin override first
        const { data: adminResults, error: adminError } = await supabase
          .from("admin_results")
          .select("next_result_number")
          .eq("game_type", gameType)
          .eq("period", currentPeriod)
          .order("created_at", { ascending: false })
          .limit(1);

        if (adminError) {
          console.error("Error fetching admin override:", adminError);
          return;
        }

        let finalResult: number;

        if (adminResults && adminResults.length > 0 && adminResults[0].next_result_number !== null) {
          finalResult = adminResults[0].next_result_number;
        } else {
          // Generate random fallback result (0-9)
          finalResult = Math.floor(Math.random() * 10);
        }

        setResultNumber(finalResult);

        // Save to game_results table if not exists
        const { data: existingResult, error: fetchError } = await supabase
          .from("game_results")
          .select("*")
          .eq("game_type", gameType)
          .eq("period", currentPeriod)
          .limit(1)
          .single();

        if (!existingResult) {
          const { error: insertError } = await supabase.from("game_results").insert([
            {
              game_type: gameType,
              period: currentPeriod,
              result_number: finalResult,
            },
          ]);

          if (insertError) {
            console.error("Error inserting game result:", insertError);
          }
        }
      } catch (err) {
        console.error("Error generating/fetching result:", err);
      }
    }

    generateOrFetchResult();
  }, [countdown, currentPeriod, gameType]);

  return (
    <div className="p-4 border rounded shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">{gameType} Game</h2>
      <p>
        <strong>Current Period:</strong> {currentPeriod || "Loading..."}
      </p>
      <p>
        <strong>Time Left:</strong> {countdown}s
      </p>
      <p>
        <strong>Result:</strong>{" "}
        {resultNumber !== null ? resultNumber : "Waiting for result..."}
      </p>
      {/* TODO: Add betting UI, user wallet, and history here */}
    </div>
  );
}

