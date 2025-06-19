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

    if (countdownInterval.current) clearInterval(countdownInterval.current);
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

  // When countdown reaches zero, generate or fetch result and settle bets
  useEffect(() => {
    if (countdown !== 0) return;

    async function generateOrFetchResult() {
      try {
        // 1. Check admin override for this game and period
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

        if (
          adminResults &&
          adminResults.length > 0 &&
          adminResults[0].next_result_number !== null
        ) {
          finalResult = adminResults[0].next_result_number;
        } else {
          // Fallback: generate random result (0-9)
          finalResult = Math.floor(Math.random() * 10);
        }

        setResultNumber(finalResult);

        // 2. Check if result already exists for this game & period
        const { data: existingResult, error: fetchError } = await supabase
          .from("game_results")
          .select("*")
          .eq("game_type", gameType)
          .eq("period", currentPeriod)
          .limit(1)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          // PGRST116 means no rows found - ignore
          console.error("Error fetching existing result:", fetchError);
          return;
        }

        if (!existingResult) {
          // 3. Insert new game result
          const { error: insertError } = await supabase.from("game_results").insert([
            {
              game_type: gameType,
              period: currentPeriod,
              result_number: finalResult,
            },
          ]);

          if (insertError) {
            console.error("Error inserting game result:", insertError);
            return;
          }

          // 4. Call RPC to settle bets for this result
          const { error: settleError } = await supabase.rpc("settle_bets_for_result", {
            p_game_type: gameType,
            p_period: currentPeriod,
          });

          if (settleError) {
            console.error("Error settling bets:", settleError);
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
