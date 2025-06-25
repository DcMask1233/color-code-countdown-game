import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  generatePeriod,
  getPeriodEndTime,
  toIST, // ✅ Import IST converter
  GameType,
  GameMode,
} from "@/lib/periodUtils";

interface UniversalGameEngineProps {
  gameType: GameType;
  gameMode: GameMode;
}

export default function UniversalGameEngine({ gameType, gameMode }: UniversalGameEngineProps) {
  const [currentPeriod, setCurrentPeriod] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(0);
  const [resultNumber, setResultNumber] = useState<number | null>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  // ⏱ Countdown & Period Updater
  useEffect(() => {
    const updateCountdown = () => {
      const nowIST = toIST(new Date()); // ✅ Use IST for both current and end time
      const period = generatePeriod(gameMode, nowIST);
      const end = getPeriodEndTime(gameMode, nowIST);
      const timeLeft = Math.max(0, Math.floor((end.getTime() - nowIST.getTime()) / 1000));

      setCurrentPeriod(period);
      setCountdown(timeLeft);
    };

    updateCountdown();

    countdownInterval.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          updateCountdown(); // 🔁 Get next period and reset countdown
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [gameMode]);

  // 🔔 Real-time result listener
  useEffect(() => {
    const channel = supabase
      .channel("game_results")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "game_results" },
        (payload) => {
          const match =
            payload.new.game_type === gameType &&
            payload.new.game_mode === gameMode &&
            payload.new.period === currentPeriod;

          if (match) {
            setResultNumber(payload.new.number);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameType, gameMode, currentPeriod]);

  // 🧾 Fallback fetch for missed result
  useEffect(() => {
    const fetchResult = async () => {
      const { data } = await supabase
        .from("game_results")
        .select("number")
        .eq("game_type", gameType)
        .eq("game_mode", gameMode)
        .eq("period", currentPeriod)
        .single();

      if (data) {
        setResultNumber(data.number);
      } else {
        setResultNumber(null);
      }
    };

    if (currentPeriod) {
      fetchResult();
    }
  }, [currentPeriod, gameType, gameMode]);

  return (
    <div className="p-4 border rounded shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">
        {gameType} - {gameMode}
      </h2>
      <p>
        <strong>Current Period:</strong> {currentPeriod || "Loading..."}
      </p>
      <p>
        <strong>Time Left:</strong> {countdown}s
      </p>
      <p>
        <strong>Result:</strong>{" "}
        {resultNumber !== null ? resultNumber : "Waiting..."}
      </p>
    </div>
  );
}
