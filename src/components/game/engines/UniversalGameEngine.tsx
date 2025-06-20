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

  useEffect(() => {
    const updatePeriodAndCountdown = () => {
      const now = new Date();

      // Pass gameType (string), NOT duration (number)
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

  // Real-time listener for new results
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
            setResultNumber(payload.new.number);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameType, currentPeriod]);

  // Fetch existing result if available
  useEffect(() => {
    async function fetchExistingResult() {
      const { data } = await supabase
        .from("game_results")
        .select("number")
        .eq("game_type", gameType)
        .eq("period", currentPeriod)
        .limit(1)
        .single();

      if (data) {
        setResultNumber(data.number);
      }
    }

    if (currentPeriod) {
      fetchExistingResult();
    }
  }, [currentPeriod, gameType]);

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
    </div>
  );
}
