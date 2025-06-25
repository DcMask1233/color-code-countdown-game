import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  generatePeriod,
  getPeriodEndTime,
  toIST,
  GameType,
  GameMode,
} from "@/lib/periodUtils";

interface UniversalGameEngineProps {
  gameType: GameType;
  gameMode: GameMode;
}

export default function UniversalGameEngine({
  gameType,
  gameMode,
}: UniversalGameEngineProps) {
  const [currentPeriod, setCurrentPeriod] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(0);
  const [resultNumber, setResultNumber] = useState<number | null>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    const updateCountdown = () => {
      const nowIST = toIST(new Date());
      const period = generatePeriod(gameMode, nowIST);
      const end = getPeriodEndTime(gameMode, nowIST);
      const timeLeft = Math.max(
        0,
        Math.floor((end.getTime() - nowIST.getTime()) / 1000)
      );

      setCurrentPeriod(period);
      setCountdown(timeLeft);
    };

    updateCountdown();

    countdownInterval.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          updateCountdown();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [gameMode]);

  useEffect(() => {
    const channel = supabase
      .channel("game_results")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "game_results",
        },
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
    <div className="p-4 border rounded shadow-md max-w-md mx-auto text-center">
      <h2 className="text-xl font-bold mb-3">
        {gameType} - {gameMode}
      </h2>

      <div className="mb-2">
        <p className="text-sm font-medium text-gray-600">Period</p>
        <p className="text-xl font-semibold text-gray-800">
          {currentPeriod || "Loading..."}
        </p>
      </div>

      <div className="mb-2">
        <p className="text-sm font-medium text-gray-600">Count Down</p>
        <p className="text-3xl font-bold text-gray-900">
          {formatCountdown(countdown)}
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-600">Result</p>
        <p className="text-xl font-semibold text-gray-800">
          {resultNumber !== null ? resultNumber : "Waiting..."}
        </p>
      </div>
    </div>
  );
}
